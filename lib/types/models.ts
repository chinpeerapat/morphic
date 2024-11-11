export interface Model {
  id: string
  name: string
  provider: string
  providerId: string
  category: 'speed' | 'quality' | 'balanced'
}

// Get provider configuration from environment variables or use defaults
const PROVIDER_NAME =
  process.env.NEXT_PUBLIC_PROVIDER_NAME || 'OpenAI-Compatible'
const PROVIDER_ID = process.env.NEXT_PUBLIC_PROVIDER_ID || 'openai-compatible'

// Get model IDs from environment variables or use defaults
const SPEED_MODEL_ID =
  process.env.NEXT_PUBLIC_MODEL_SPEED || 'openai/gpt-4o-mini'
const BALANCED_MODEL_ID =
  process.env.NEXT_PUBLIC_MODEL_BALANCED || 'anthropic/claude-3-5-haiku'
const QUALITY_MODEL_ID =
  process.env.NEXT_PUBLIC_MODEL_QUALITY || 'anthropic/claude-3-5-sonnet'

export const models: Model[] = [
  {
    id: BALANCED_MODEL_ID,
    name: 'Balanced',
    provider: PROVIDER_NAME,
    providerId: PROVIDER_ID,
    category: 'balanced'
  },
  {
    id: SPEED_MODEL_ID,
    name: 'Speed',
    provider: PROVIDER_NAME,
    providerId: PROVIDER_ID,
    category: 'speed'
  },
  {
    id: QUALITY_MODEL_ID,
    name: 'Quality',
    provider: PROVIDER_NAME,
    providerId: PROVIDER_ID,
    category: 'quality'
  }
]
