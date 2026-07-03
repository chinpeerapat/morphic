import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  resetSupabaseConfigWarningsForTests,
  warnAboutSupabaseAuthConfig
} from '../config'

describe('warnAboutSupabaseAuthConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    resetSupabaseConfigWarningsForTests()
    vi.restoreAllMocks()
  })

  it('warns when Supabase is configured but auth is disabled', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
    vi.stubEnv('ENABLE_AUTH', 'false')

    warnAboutSupabaseAuthConfig()

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'ENABLE_AUTH=false keeps the app in anonymous mode'
      )
    )
  })

  it('warns when auth is enabled without Supabase config', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('ENABLE_AUTH', 'true')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

    warnAboutSupabaseAuthConfig()

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'ENABLE_AUTH=true but Supabase is not fully configured'
      )
    )
  })
})
