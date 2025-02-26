import { getRedisClient } from '@/lib/redis/config'
import { Model } from '@/lib/types/models'
import { isProviderEnabled } from '@/lib/utils/registry'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 30

// Model schema for validation
const modelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  providerId: z.string(),
  enabled: z.boolean(),
  toolCallType: z.enum(['native', 'manual']),
  toolCallModel: z.string().optional()
})

// Get all available models
export async function GET(req: NextRequest) {
  try {
    const redis = await getRedisClient()
    const modelsKey = 'models:config'

    // Get models from Redis
    const modelsData = await redis.hgetall(modelsKey)

    if (!modelsData) {
      // Return default models if none are stored
      const defaultModels = getDefaultModels()
      return NextResponse.json(defaultModels)
    }

    // Parse models data
    let models: Model[] = []
    try {
      if (typeof modelsData.models === 'string') {
        models = JSON.parse(modelsData.models)
      } else if (Array.isArray(modelsData.models)) {
        models = modelsData.models
      }
    } catch (e) {
      console.error('Failed to parse models data:', e)
      // Return default models if parsing fails
      const defaultModels = getDefaultModels()
      return NextResponse.json(defaultModels)
    }

    // Filter models by enabled providers
    const filteredModels = models.filter(
      model => isProviderEnabled(model.providerId) && model.enabled !== false
    )

    return NextResponse.json(filteredModels)
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update models configuration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Check if body is an array
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Expected an array of models' },
        { status: 400 }
      )
    }

    // Validate each model
    const validationResults = body.map(model => modelSchema.safeParse(model))
    const invalidModels = validationResults.filter(result => !result.success)

    if (invalidModels.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid model data',
          details: invalidModels.map(result =>
            // @ts-ignore - We know these are errors
            result.error.format()
          )
        },
        { status: 400 }
      )
    }

    // Get valid models
    const validModels = validationResults
      .filter(
        (result): result is { success: true; data: Model } => result.success
      )
      .map(result => result.data)

    const redis = await getRedisClient()
    const modelsKey = 'models:config'

    // Save models configuration
    await redis.hmset(modelsKey, {
      models: JSON.stringify(validModels),
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json(validModels)
  } catch (error) {
    console.error('Error updating models:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get default models
function getDefaultModels(): Model[] {
  return [
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o mini',
      provider: 'OpenAI',
      providerId: 'openai',
      enabled: true,
      toolCallType: 'native'
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      providerId: 'openai',
      enabled: true,
      toolCallType: 'native'
    },
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      providerId: 'anthropic',
      enabled: true,
      toolCallType: 'native'
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      providerId: 'anthropic',
      enabled: true,
      toolCallType: 'native'
    }
  ]
}
