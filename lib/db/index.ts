import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as relations from './relations'
import * as schema from './schema'

// For server-side usage only
// Use restricted user for application if available, otherwise fall back to regular user
const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

// Connection with connection pooling for server environments
// Prefer restricted user for application runtime
const connectionString =
  process.env.DATABASE_RESTRICTED_URL ?? // Prefer restricted user
  process.env.DATABASE_URL ??
  (isTest || process.env.NEXT_PHASE === 'phase-production-build'
    ? 'postgres://user:pass@localhost:5432/testdb'
    : undefined)

if (!connectionString) {
  throw new Error(
    'DATABASE_URL or DATABASE_RESTRICTED_URL environment variable is not set'
  )
}

// Log which connection is being used (for debugging)
if (isDevelopment) {
  console.log(
    '[DB] Using connection:',
    process.env.DATABASE_RESTRICTED_URL
      ? 'Restricted User (RLS Active)'
      : 'Owner User (RLS Bypassed)'
  )
}

// SSL configuration: Use environment variable to control SSL
// DATABASE_SSL_DISABLED=true disables SSL completely (for local/Docker PostgreSQL)
// Default is to enable SSL for cloud databases (Neon, Supabase, etc.) and disable for local/docker
const isLocalhost =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes('postgres:5432')

const sslDisabled =
  process.env.DATABASE_SSL_DISABLED === 'true' ||
  connectionString.includes('sslmode=disable') ||
  (isLocalhost && !connectionString.includes('sslmode=require'))

const sslConfig = sslDisabled
  ? false // Disable SSL entirely for local PostgreSQL
  : process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true'
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false }

const client = postgres(connectionString, {
  ssl: sslConfig,
  prepare: false,
  max: 20 // Max 20 connections
})

export const db = drizzle(client, {
  schema: { ...schema, ...relations }
})

// Helper type for all tables
export type Schema = typeof schema

// Verify restricted user permissions on startup
if (process.env.DATABASE_RESTRICTED_URL && !isTest) {
  // Only run verification in server environments, not during build
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    ;(async () => {
      try {
        const result = await db.execute<{ current_user: string }>(
          sql`SELECT current_user`
        )
        const currentUser = result[0]?.current_user

        if (isDevelopment) {
          console.log('[DB] ✓ Connection verified as user:', currentUser)
        }

        // Verify it's the restricted user (app_user)
        if (
          currentUser &&
          !currentUser.includes('app_user') &&
          !currentUser.includes('neondb_owner')
        ) {
          console.warn(
            '[DB] ⚠️ Warning: Expected app_user but connected as:',
            currentUser
          )
        }
      } catch (error) {
        console.error('[DB] ✗ Failed to verify database connection:', error)
        // Log the error but don't terminate the application
        // This allows development to continue even with connection issues
      }
    })()
  }
}
