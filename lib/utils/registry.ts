import { createOpenAI } from '@ai-sdk/openai'
import { experimental_createProviderRegistry as createProviderRegistry } from 'ai'

const providerId = process.env.PROVIDER_ID || 'openai-compatible'

const registry = createProviderRegistry({
  [providerId]: createOpenAI({
    apiKey: process.env.OPENAI_COMPATIBLE_API_KEY,
    baseURL: process.env.OPENAI_COMPATIBLE_API_BASE_URL
  })
})

export function getModel(model: string): any {
  return registry.languageModel(model)
}

export function isProviderEnabled(checkProviderId: string): boolean {
  switch (checkProviderId) {
    case providerId:
      return (
        !!process.env.OPENAI_COMPATIBLE_API_KEY &&
        !!process.env.OPENAI_COMPATIBLE_API_BASE_URL
      )
    default:
      return false
  }
}
