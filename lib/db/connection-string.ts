const BUILD_PLACEHOLDER_URL =
  'postgresql://build:build@127.0.0.1:5432/build?sslmode=disable'

export function resolveDatabaseConnectionString(
  env: NodeJS.ProcessEnv = process.env
): string {
  const configured = env.DATABASE_RESTRICTED_URL ?? env.DATABASE_URL

  if (configured) {
    return configured
  }

  if (env.NODE_ENV === 'test') {
    return 'postgres://user:pass@localhost:5432/testdb'
  }

  // Next.js evaluates server modules while collecting route data at build time.
  // Avoid failing the production build when DATABASE_URL is only configured at runtime.
  if (env.NEXT_PHASE === 'phase-production-build') {
    return BUILD_PLACEHOLDER_URL
  }

  throw new Error(
    'DATABASE_URL or DATABASE_RESTRICTED_URL environment variable is not set'
  )
}

export function isDatabaseBuildPhase(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return env.NEXT_PHASE === 'phase-production-build'
}
