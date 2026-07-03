import { createClient } from '@supabase/supabase-js'

import { getSupabaseSecretKey, getSupabaseUrl } from './keys'

export function createAdminClient() {
  const url = getSupabaseUrl()
  const secretKey = getSupabaseSecretKey()

  if (!url || !secretKey) {
    throw new Error(
      'Supabase admin client is not configured. Set SUPABASE_SECRET_KEY.'
    )
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
