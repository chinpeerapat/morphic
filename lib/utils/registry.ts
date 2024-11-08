import { createOpenAI } from '@ai-sdk/openai'
import { experimental_createProviderRegistry as createProviderRegistry } from 'ai'

const registry = createProviderRegistry({
  openrouter: createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
  })
})

export function getModel(model: string): any {
  return registry.languageModel(model)
}

export function isProviderEnabled(providerId: string): boolean {
  switch (providerId) {
    case 'openrouter':
      return !!process.env.OPENROUTER_API_KEY
    default:
      return false
  }
}
