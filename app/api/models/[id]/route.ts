import { getRedisClient } from '@/lib/redis/config'
import { Model } from '@/lib/types/models'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 30

// Model update schema for validation
const modelUpdateSchema = z.object({
  name: z.string().optional(),
  provider: z.string().optional(),
  providerId: z.string().optional(),
  enabled: z.boolean().optional(),
  toolCallType: z.enum(['native', 'manual']).optional(),
  toolCallModel: z.string().optional()
})

// Get a specific model
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = params.id
    const redis = await getRedisClient()
    const modelsKey = 'models:config'

    // Get models from Redis
    const modelsData = await redis.hgetall(modelsKey)

    if (!modelsData) {
      // Check if requested model is in default models
      const defaultModels = getDefaultModels()
      const defaultModel = defaultModels.find(model => model.id === modelId)

      if (defaultModel) {
        return NextResponse.json(defaultModel)
      } else {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 })
      }
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
      // Check if requested model is in default models
      const defaultModels = getDefaultModels()
      const defaultModel = defaultModels.find(model => model.id === modelId)

      if (defaultModel) {
        return NextResponse.json(defaultModel)
      } else {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 })
      }
    }

    // Find the requested model
    const model = models.find(model => model.id === modelId)

    if (!model) {
      // Check if requested model is in default models
      const defaultModels = getDefaultModels()
      const defaultModel = defaultModels.find(model => model.id === modelId)

      if (defaultModel) {
        return NextResponse.json(defaultModel)
      } else {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 })
      }
    }

    return NextResponse.json(model)
  } catch (error) {
    console.error('Error fetching model:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update a specific model
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = params.id
    const body = await req.json()

    // Validate model update data
    const validationResult = modelUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid model data',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data
    const redis = await getRedisClient()
    const modelsKey = 'models:config'

    // Get models from Redis
    const modelsData = await redis.hgetall(modelsKey)

    let models: Model[] = []
    if (modelsData) {
      try {
        if (typeof modelsData.models === 'string') {
          models = JSON.parse(modelsData.models)
        } else if (Array.isArray(modelsData.models)) {
          models = modelsData.models
        }
      } catch (e) {
        console.error('Failed to parse models data:', e)
        // Start with default models if parsing fails
        models = getDefaultModels()
      }
    } else {
      // Start with default models if none are stored
      models = getDefaultModels()
    }

    // Find the model to update
    const modelIndex = models.findIndex(model => model.id === modelId)

    if (modelIndex === -1) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    // Update the model
    models[modelIndex] = {
      ...models[modelIndex],
      ...updateData
    }

    // Save updated models
    await redis.hmset(modelsKey, {
      models: JSON.stringify(models),
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json(models[modelIndex])
  } catch (error) {
    console.error('Error updating model:', error)
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
