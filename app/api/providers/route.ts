import { isProviderEnabled } from '@/lib/utils/registry'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

// Get status of all providers
export async function GET(req: NextRequest) {
  try {
    // List of all possible providers
    const providers = [
      'openai',
      'anthropic',
      'google',
      'azure',
      'fireworks',
      'groq',
      'deepseek',
      'xai',
      'ollama'
    ]

    // Check which providers are enabled
    const providerStatus = providers.reduce((status, providerId) => {
      return {
        ...status,
        [providerId]: isProviderEnabled(providerId)
      }
    }, {})

    return NextResponse.json(providerStatus)
  } catch (error) {
    console.error('Error checking provider status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Check status of a specific provider
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    const { providerId } = body

    // Check if provider is enabled
    const isEnabled = isProviderEnabled(providerId)

    return NextResponse.json({
      providerId,
      enabled: isEnabled
    })
  } catch (error) {
    console.error('Error checking provider status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
