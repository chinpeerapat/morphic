export interface Model {
  id: string
  name: string
  provider: string
  providerId: string
}

export const models: Model[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    providerId: 'openrouter'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openrouter',
    providerId: 'openrouter'
  },
  {
    id: 'anthropic/claude-3.5-sonnet:beta',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    providerId: 'openrouter'
  },
  {
    id: 'anthropic/claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'openrouter',
    providerId: 'openrouter'
  },
  {
    id: 'google/gemini-flash-1.5-8b',
    name: 'Gemini Flash 1.5 8B',
    provider: 'openrouter',
    providerId: 'openrouter'
  },
  {
    id: 'meta-llama/llama-3-70b-instruct',
    name: 'LLama 3 70B Instruct',
    provider: 'openrouter',
    providerId: 'openrouter'
  },
  {
    id: 'qwen2.5',
    name: 'Qwen 2.5',
    provider: 'Ollama',
    providerId: 'ollama'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'Azure',
    providerId: 'azure'
  },
  {
    id: process.env.NEXT_PUBLIC_OPENAI_COMPATIBLE_MODEL || 'undefined',
    name: process.env.NEXT_PUBLIC_OPENAI_COMPATIBLE_MODEL || 'Undefined',
    provider: 'OpenAI Compatible',
    providerId: 'openai-compatible'
  }
]
