import {
  getSupabaseEnvSource,
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
  hasSupabasePublicConfig
} from './keys'

let warnedOnce = false

export function resetSupabaseConfigWarningsForTests() {
  warnedOnce = false
}

export function warnAboutSupabaseAuthConfig() {
  if (process.env.NODE_ENV === 'test' || warnedOnce) {
    return
  }

  warnedOnce = true

  const url = getSupabaseUrl()
  const publishableKey = getSupabasePublishableKey()
  const secretKey = getSupabaseSecretKey()
  const envSource = getSupabaseEnvSource()

  if (url && !publishableKey) {
    console.warn(
      '[auth] NEXT_PUBLIC_SUPABASE_URL is set but no publishable key was found.\n' +
        '       Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
    return
  }

  if (!url && publishableKey) {
    console.warn(
      '[auth] Supabase publishable key is set but NEXT_PUBLIC_SUPABASE_URL is missing.'
    )
    return
  }

  if (!hasSupabasePublicConfig()) {
    if (process.env.ENABLE_AUTH === 'true') {
      console.warn(
        '[auth] ENABLE_AUTH=true but Supabase is not fully configured.\n' +
          '       Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then restart/rebuild.'
      )
    }
    return
  }

  if (envSource.publishableKey === 'anon') {
    console.warn(
      '[auth] Using legacy env var NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
        '       Rename it to NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY when convenient.'
    )
  }

  if (envSource.secretKey === 'service_role') {
    console.warn(
      '[auth] Using legacy env var SUPABASE_SERVICE_ROLE_KEY.\n' +
        '       Rename it to SUPABASE_SECRET_KEY when convenient.'
    )
  }

  if (process.env.ENABLE_AUTH === 'false') {
    console.warn(
      '[auth] Supabase is configured, but ENABLE_AUTH=false keeps the app in anonymous mode.\n' +
        '       Set ENABLE_AUTH=true to require authenticated users.'
    )
    return
  }

  if (!secretKey) {
    console.warn(
      '[auth] Supabase sign-in is enabled, but SUPABASE_SECRET_KEY is missing.\n' +
        '       Account deletion and other admin auth actions will be unavailable.'
    )
  }
}
