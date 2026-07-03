import { afterEach, describe, expect, it } from 'vitest'

import {
  getSupabaseEnvSource,
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  hasSupabaseAdminConfig,
  hasSupabasePublicConfig
} from '../keys'

const ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
] as const

describe('supabase keys', () => {
  const originalEnv = Object.fromEntries(
    ENV_KEYS.map(key => [key, process.env[key]])
  )

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = originalEnv[key]
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  })

  it('prefers publishable key over legacy anon key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy-anon'

    expect(getSupabasePublishableKey()).toBe('sb_publishable_test')
    expect(getSupabaseEnvSource().publishableKey).toBe('publishable')
    expect(hasSupabasePublicConfig()).toBe(true)
  })

  it('falls back to legacy anon key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy-anon'

    expect(getSupabasePublishableKey()).toBe('legacy-anon')
    expect(getSupabaseEnvSource().publishableKey).toBe('anon')
    expect(hasSupabasePublicConfig()).toBe(true)
  })

  it('falls back to legacy service role key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'legacy-service-role'

    expect(getSupabaseSecretKey()).toBe('legacy-service-role')
    expect(getSupabaseEnvSource().secretKey).toBe('service_role')
    expect(hasSupabaseAdminConfig()).toBe(true)
  })

  it('returns false when only URL is configured', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'

    expect(hasSupabasePublicConfig()).toBe(false)
    expect(hasSupabaseAdminConfig()).toBe(false)
  })
})
