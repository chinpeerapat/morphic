export type DatabaseSslConfig = false | { rejectUnauthorized: boolean }

/**
 * SSL for postgres.js.
 *
 * - `DATABASE_SSL_DISABLED=true` turns SSL off (local/Docker Postgres).
 * - Otherwise SSL stays on. Certificate verification is off by default so
 *   hosted databases (Supabase, Neon) work with Bun and TLS-inspecting
 *   environments that present a self-signed cert in the chain.
 * - `DATABASE_SSL_REJECT_UNAUTHORIZED=true` requires a public CA match.
 */
export function getDatabaseSslConfig(): DatabaseSslConfig {
  if (process.env.DATABASE_SSL_DISABLED === 'true') {
    return false
  }

  return {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true'
  }
}
