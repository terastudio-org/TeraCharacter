import { NextResponse } from 'next/server';
import { getAvailableModels, getUnfilteredModels, getProviderStatus } from '@/app/actions/chat';

export async function GET() {
  try {
    const [models, unfilteredModels, status] = await Promise.all([
      getAvailableModels(),
      getUnfilteredModels(),
      getProviderStatus()
    ]);

    // Group models by provider
    const modelsByProvider = models.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, {} as Record<string, any[]>);

    const response = {
      success: true,
      providers: {
        available: Object.keys(status).filter(provider => status[provider].available),
        models_by_provider: modelsByProvider,
        total_models: models.length,
        unfiltered_models: unfilteredModels.length
      },
      status,
      models: {
        all: models,
        unfiltered: unfilteredModels
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch provider info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch provider information',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}