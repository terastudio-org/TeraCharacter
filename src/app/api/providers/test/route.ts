import { NextRequest, NextResponse } from 'next/server';
import { testProviderConnection } from '@/app/actions/chat';

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider is required' },
        { status: 400 }
      );
    }

    const result = await testProviderConnection(provider);

    return NextResponse.json({
      success: result.success,
      provider,
      ...result
    });
  } catch (error) {
    console.error('Failed to test provider connection:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test provider connection',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}