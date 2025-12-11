# AI Provider Setup Guide

This guide explains how to set up different AI providers for TeraCharacter, including unfiltered content options.

## Provider Overview

TeraCharacter supports multiple AI providers, each with different capabilities:

| Provider | Content Filter | Speed | Cost | Best For |
|----------|---------------|-------|------|----------|
| **OpenAI** | Censored | Fast | High | General use, safety-critical applications |
| **OpenRouter** | Varies | Medium | Variable | Access to multiple models |
| **Hugging Face** | Unfiltered | Medium | Low | Open-source models, experimentation |
| **Groq** | Unfiltered | Ultra-fast | Very Low | Real-time applications, uncensored chat |
| **Local (Ollama)** | Unfiltered | Variable | Free | Privacy-focused, offline use |

## Setting Up Each Provider

### 1. OpenAI (Recommended for beginners)

**Features:**
- GPT-4o, GPT-4o-mini, GPT-4 Turbo, GPT-3.5 Turbo
- Safety filters enabled
- High quality responses
- Function calling support

**Setup:**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Add to `.env.local`: `OPENAI_API_KEY=your_key_here`

**Pricing:** Pay-per-use, varies by model

### 2. Hugging Face Inference API

**Features:**
- Access to thousands of open-source models
- Llama 3.1, Mixtral, DialoGPT and more
- Unfiltered content support
- Free tier available

**Setup:**
1. Visit [Hugging Face](https://huggingface.co/)
2. Create account and sign in
3. Go to [Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new token with "Read" permissions
5. Add to `.env.local`: `HF_API_KEY=your_token_here`

**Models Available:**
- `meta-llama/Meta-Llama-3.1-70B-Instruct` - Most capable open model
- `meta-llama/Meta-Llama-3.1-8B-Instruct` - Fast and efficient
- `mistralai/Mixtral-8x7B-Instruct-v0.1` - High-quality mixture model
- `microsoft/DialoGPT-*` - Conversation-focused models

**Pricing:** 
- Free tier: 1,000 requests/month
- Paid: $0.000008 per token

### 3. Groq (Ultra-fast Inference)

**Features:**
- Extremely fast inference speeds
- Unfiltered content support
- Llama 3.1, Mixtral, Gemma models
- Function calling support

**Setup:**
1. Visit [Groq Console](https://console.groq.com/)
2. Create an account
3. Go to API Keys section
4. Create a new API key
5. Add to `.env.local`: `GROQ_API_KEY=your_key_here`

**Models Available:**
- `llama-3.1-70b-versatile` - Best overall performance
- `llama-3.1-8b-instant` - Fastest responses
- `mixtral-8x7b-32768` - Balanced speed/quality
- `gemma2-9b-it` - Google's Gemma model

**Pricing:** 
- Free tier: Generous limits
- Very competitive rates

### 4. OpenRouter (Model Aggregator)

**Features:**
- Access to 100+ models from various providers
- Unified API
- Model comparison
- Helicone integration for monitoring

**Setup:**
1. Visit [OpenRouter](https://openrouter.ai/)
2. Create account
3. Go to Keys section
4. Create API key
5. Add to `.env.local`: 
   ```
   OPENROUTER_API_KEY=your_key_here
   HELICONE_API_KEY=your_helicone_key_here
   ```

**Models Available:**
- Various OpenAI, Anthropic, and open-source models
- Custom model routing
- Automatic failover

### 5. Local (Ollama)

**Features:**
- Complete privacy
- No API costs
- Full control
- Unfiltered content

**Setup:**
1. Install [Ollama](https://ollama.ai/)
2. Pull desired models:
   ```bash
   ollama pull llama3.1
   ollama pull codellama
   ollama pull mistral
   ```
3. Start Ollama service
4. Add to `.env.local`: `OLLAMA_BASE_URL=http://localhost:11434`

**Available Models:**
- `llama3.1` - Meta's latest Llama model
- `codellama` - Code-focused model
- `mistral` - Fast conversation model
- Many others available via `ollama pull <model-name>`

## Unfiltered Content Setup

### What is Unfiltered Content?

Unfiltered models allow conversations without content restrictions. This enables:
- Adult-oriented discussions
- Controversial topics
- Creative writing
- Educational content on sensitive subjects

### Recommended Unfiltered Models:

1. **Groq (Fastest):**
   - `llama-3.1-70b-versatile`
   - `llama-3.1-8b-instant`

2. **Hugging Face (Most Options):**
   - `meta-llama/Meta-Llama-3.1-70B-Instruct`
   - `meta-llama/Meta-Llama-3.1-8B-Instruct`
   - `mistralai/Mixtral-8x7B-Instruct-v0.1`

3. **Local (Privacy):**
   - Any model available through Ollama

### Setting Up for Unfiltered Chat:

1. **Configure Provider:**
   - Set up Groq, Hugging Face, or Local provider
   - Obtain necessary API keys

2. **Select Unfiltered Model:**
   - Use the Provider Selector in the app
   - Toggle "Show unfiltered models only"
   - Choose from available unfiltered models

3. **Character Configuration:**
   - Unfiltered models work with all character types
   - Adjust temperature/top_p for desired creativity
   - Consider increasing max_tokens for longer responses

## Provider Selection Tips

### For Beginners:
- Start with **OpenAI** for reliability and safety
- Upgrade to **Groq** for faster, unfiltered responses

### For Developers:
- Use **OpenRouter** for model experimentation
- **Hugging Face** for open-source exploration
- **Local (Ollama)** for privacy and cost savings

### For Production:
- **Groq** for real-time applications
- **OpenAI** for enterprise features
- **Multiple providers** for redundancy

### For Privacy-Conscious:
- **Local (Ollama)** for complete control
- **Hugging Face** with self-hosted inference

## Testing Provider Connections

Use the Provider Selector in the app to:
- Check provider availability
- Test connections
- View available models
- Monitor status

## Troubleshooting

### Common Issues:

1. **"Provider not configured"**
   - Check API key is set in environment
   - Verify key has correct permissions
   - Test connection using Provider Selector

2. **"Model not found"**
   - Ensure model ID is correct
   - Check if model is available for your provider
   - Verify your API tier supports the model

3. **"Rate limit exceeded"**
   - Check provider usage limits
   - Implement request queuing
   - Consider upgrading to paid tier

4. **Slow responses**
   - Try faster models (e.g., Groq's instant models)
   - Reduce max_tokens
   - Check network connectivity

### Getting Help:

1. Check provider documentation
2. Use the built-in connection tester
3. Monitor API usage in provider dashboards
4. Test with different models

## Security Considerations

### API Key Security:
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor usage for anomalies

### Content Safety:
- Unfiltered models may generate inappropriate content
- Implement user content moderation
- Set appropriate usage guidelines
- Monitor conversations for policy violations

### Privacy:
- Local models provide complete privacy
- Cloud providers may log requests
- Review provider privacy policies
- Consider data retention policies

## Cost Optimization

### Reducing Costs:
1. Use smaller models when appropriate
2. Implement response caching
3. Set reasonable max_tokens limits
4. Monitor usage patterns
5. Use free tiers when available

### Cost Comparison (per 1K tokens):
- OpenAI GPT-4o: ~$0.005
- Groq: ~$0.001
- Hugging Face: ~$0.008
- Local: Free (after setup)

Choose the provider that best fits your needs for speed, cost, and content filtering requirements!