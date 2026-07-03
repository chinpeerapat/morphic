import { cookies } from 'next/headers'

import { createServerClient } from '@supabase/ssr'

import { getSupabasePublishableKey, getSupabaseUrl } from './keys'

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = getSupabasePublishableKey()

  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }
      }
    }
  )
}
