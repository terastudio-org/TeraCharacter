'use server';

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { characters, chat_sessions, ChatMessageArray} from '@/server/db/schema';
import { db } from '@/server/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth } from '@/server/auth';
import { providerManager, getProviderByModelId, supportsUnfiltered } from '@/lib/providers';
import { getAllModels } from '@/lib/provider-config';

// Keep OpenRouter as fallback for existing functionality
const openrouter = createOpenAI({
  baseURL: "https://openrouter.helicone.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    "HTTP-Referer": "https://opencharacter.org", // Optional, for including your app on openrouter.ai rankings.
    "X-Title": "OpenCharacter", // Optional. Shows in rankings on openrouter.ai.
  }
});

export async function createChatSession(character: typeof characters.$inferInsert) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    throw new Error("User not authenticated");
  }

  if (character.id === undefined || character.id === null) {
    throw new Error("No character found");
  } 

  try {
    const newSession = await db.insert(chat_sessions)
      .values({
        user_id: session.user.id!,
        character_id: character.id!,
        messages: [{role: "system", content: character.description}, {role: "assistant", content: character.greeting }] as ChatMessageArray,
        interaction_count: 1,
        last_message_timestamp: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning({ id: chat_sessions.id });

    console.log(`Created new chat session: ${newSession[0].id}`);
    return newSession[0].id;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw new Error("Failed to create chat session");
  }
}

export async function continueConversation(messages: CoreMessage[], model_name: string, character: typeof characters.$inferSelect, chat_session_id?: string) {
  const session = await auth();

  try {
    // Update character interaction count
    const [currentCharacter] = await db.select()
      .from(characters)
      .where(eq(characters.id, character.id))
      .limit(1);

    if (!currentCharacter) {
      throw new Error('Character not found');
    }

    await db.update(characters)
      .set({
        interactionCount: (currentCharacter.interactionCount ?? 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(characters.id, character.id));
  } catch (error) {
    console.error('Failed to update interaction count:', error);
  }

  try {
    // Check if we have a new provider available
    const providerType = getProviderByModelId(model_name);
    
    if (providerType && providerType !== 'openai') {
      // Use new provider system for HF/Groq
      return await continueConversationWithProvider(messages, model_name, character, chat_session_id, session);
    } else {
      // Fallback to OpenRouter for backward compatibility
      const model = openrouter(model_name);
      return await continueConversationWithOpenRouter(model, messages, character, chat_session_id, session);
    }
  } catch (error) {
    console.error('Failed to generate or stream response:', JSON.stringify(error));
    throw new Error('Failed to generate response. Please try again later.');
  }
}

// Enhanced conversation with new providers
async function continueConversationWithProvider(
  messages: CoreMessage[], 
  model_name: string, 
  character: typeof characters.$inferSelect, 
  chat_session_id: string | undefined,
  session: any
) {
  const provider = providerManager.getProvider(model_name);
  if (!provider) {
    throw new Error(`Provider not available for model: ${model_name}`);
  }

  const options = {
    max_tokens: character.max_tokens ?? 200,
    temperature: character.temperature ?? 0.7,
    top_p: character.top_p ?? 0.9,
    streaming: true,
    parameters: {
      frequency_penalty: character.frequency_penalty ?? 0.0,
      presence_penalty: character.presence_penalty ?? 0.0,
      // Add unfiltered content support if available
      ...(supportsUnfiltered(model_name) && {
        // These parameters help with unfiltered content on supported models
        repetition_penalty: 1.1,
        no_repeat_ngram_size: 3
      })
    }
  };

  const result = await provider.generateCompletion(model_name, messages, options);
  
  // Handle streaming vs regular response
  if (result instanceof ReadableStream) {
    // For streaming responses, create a text stream
    const stream = new ReadableStream({
      start(controller) {
        const reader = result.getReader();
        const decoder = new TextDecoder();
        
        function pump() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            
            const chunk = decoder.decode(value);
            controller.enqueue(chunk);
            pump();
          });
        }
        
        pump();
      }
    });
    
    const streamableValue = createStreamableValue(stream);
    return streamableValue.value;
  } else {
    // For non-streaming responses, create a simple text stream
    const text = result.choices?.[0]?.message?.content || '';
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(text);
        controller.close();
      }
    });
    
    const streamableValue = createStreamableValue(stream);
    return streamableValue.value;
  }
}

// Original OpenRouter implementation
async function continueConversationWithOpenRouter(
  model: any,
  messages: CoreMessage[], 
  character: typeof characters.$inferSelect, 
  chat_session_id: string | undefined,
  session: any
) {
  const result = await streamText({
    model: model,
    messages,
    temperature: character.temperature ?? 1.0,
    topP: character.top_p ?? 1.0,
    topK: character.top_k ?? 0,
    frequencyPenalty: character.frequency_penalty ?? 0.0,
    presencePenalty: character.presence_penalty ?? 0.0,
    maxTokens: character.max_tokens ?? 200,
    onFinish: async (completion) => {
      if (session?.user) {
        try {
          messages.push({
            role: 'assistant',
            content: completion.text
          });

          let chatSession;

          if (chat_session_id) {
            // If chat_session_id is provided, fetch that specific session
            chatSession = await db.select()
              .from(chat_sessions)
              .where(
                and(
                  eq(chat_sessions.id, chat_session_id),
                  eq(chat_sessions.user_id, session.user.id!),
                  eq(chat_sessions.character_id, character.id)
                )
              )
              .limit(1)
              .then(rows => rows[0]);
          } else {
            // If no chat_session_id, find the most recent session
            chatSession = await db.select()
              .from(chat_sessions)
              .where(
                and(
                  eq(chat_sessions.user_id, session.user.id!),
                  eq(chat_sessions.character_id, character.id)
                )
              )
              .orderBy(desc(chat_sessions.updated_at))
              .limit(1)
              .then(rows => rows[0]);
          }

          if (chatSession) {
            await db.update(chat_sessions)
              .set({
                messages: messages as ChatMessageArray,
                interaction_count: chatSession.interaction_count + 1,
                last_message_timestamp: new Date(),
                updated_at: new Date()
              })
              .where(eq(chat_sessions.id, chatSession.id));
            console.log(`Updated chat session: ${chatSession.id}`);
          } else {
            const newSession = await db.insert(chat_sessions)
              .values({
                user_id: session.user.id!,
                character_id: character.id,
                messages: messages as ChatMessageArray,
                interaction_count: 1,
                last_message_timestamp: new Date(),
                created_at: new Date(),
                updated_at: new Date()
              })
              .returning({ id: chat_sessions.id });
            console.log(`Created new chat session: ${newSession[0].id}`);
          }
        } catch (error) {
          console.error('Failed to update chat session:', error);
        }
      }
    }
  });

  const stream = createStreamableValue(result.textStream);
  console.log('Successfully created streamable value');
  return stream.value;
}

export async function getConversations() {
  const session = await auth();

  if (!session || !session.user) {
    return { error: true, message: "No user found" };
  }

  try {
    const latestSessions = await db.select({
      id: chat_sessions.id,
      character_id: chat_sessions.character_id,
      last_message_timestamp: chat_sessions.last_message_timestamp,
      updated_at: chat_sessions.updated_at,
      interaction_count: chat_sessions.interaction_count,
      character_name: characters.name,
      character_avatar: characters.avatar_image_url,
    })
      .from(chat_sessions)
      .leftJoin(characters, eq(chat_sessions.character_id, characters.id))
      .where(eq(chat_sessions.user_id, session.user.id!))
      .innerJoin(
        db.select({
          character_id: chat_sessions.character_id,
          max_updated_at: sql<Date>`MAX(${chat_sessions.updated_at})`.as('max_updated_at'),
        })
          .from(chat_sessions)
          .where(eq(chat_sessions.user_id, session.user.id!))
          .groupBy(chat_sessions.character_id)
          .as('latest_sessions'),
        and(
          eq(chat_sessions.character_id, sql.raw('latest_sessions.character_id')),
          eq(chat_sessions.updated_at, sql.raw('latest_sessions.max_updated_at'))
        )
      )
      .orderBy(desc(chat_sessions.updated_at));

    return {
      error: false,
      conversations: latestSessions.map(session => ({
        id: session.id,
        character_id: session.character_id,
        character_name: session.character_name,
        character_avatar: session.character_avatar,
        last_message_timestamp: new Date(session.last_message_timestamp).toISOString(),
        updated_at: new Date(session.updated_at).toISOString(),
        interaction_count: session.interaction_count,
      }))
    };
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return { error: true, message: "Failed to fetch conversations" };
  }
}

export async function getAllConversationsByCharacter(character_id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const conversations = await db.query.chat_sessions.findMany({
    where: and(
      eq(chat_sessions.user_id, session.user.id),
      eq(chat_sessions.character_id, character_id)
    ),
    orderBy: [desc(chat_sessions.updated_at)]
  });

  return conversations;
}

// Provider utilities
export async function getAvailableModels() {
  return getAllModels();
}

export async function getUnfilteredModels() {
  return getAllModels().filter(model => supportsUnfiltered(model.id));
}

export async function getProviderStatus() {
  const status: Record<string, any> = {};
  
  // Check OpenRouter status
  status.openrouter = {
    available: !!process.env.OPENROUTER_API_KEY,
    error: null
  };
  
  // Check Hugging Face status
  try {
    status.huggingface = await providerManager.getProviderStatus('huggingface');
  } catch (error) {
    status.huggingface = { 
      available: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
  
  // Check Groq status
  try {
    status.groq = await providerManager.getProviderStatus('groq');
  } catch (error) {
    status.groq = { 
      available: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
  
  return status;
}

export async function testProviderConnection(provider: string) {
  try {
    const status = await providerManager.getProviderStatus(provider);
    return { success: true, status };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}