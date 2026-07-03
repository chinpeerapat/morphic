function readEnv(name: string) {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

export function getSupabasePublishableKey() {
  return (
    readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ??
    readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )
}

export function getSupabaseSecretKey() {
  return readEnv('SUPABASE_SECRET_KEY') ?? readEnv('SUPABASE_SERVICE_ROLE_KEY')
}

export function getSupabaseUrl() {
  return readEnv('NEXT_PUBLIC_SUPABASE_URL')
}

export function hasSupabasePublicConfig() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey())
}

export function hasSupabaseAdminConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseSecretKey())
}

export type SupabaseEnvSource = {
  publishableKey: 'publishable' | 'anon' | null
  secretKey: 'secret' | 'service_role' | null
}

export function getSupabaseEnvSource(): SupabaseEnvSource {
  return {
    publishableKey: readEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
      ? 'publishable'
      : readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        ? 'anon'
        : null,
    secretKey: readEnv('SUPABASE_SECRET_KEY')
      ? 'secret'
      : readEnv('SUPABASE_SERVICE_ROLE_KEY')
        ? 'service_role'
        : null
  }
}
