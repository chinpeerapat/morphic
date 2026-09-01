import { afterEach, describe, expect, it, vi } from 'vitest'

describe('database configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('defers the missing connection string error until database access', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DATABASE_URL', '')
    vi.stubEnv('DATABASE_RESTRICTED_URL', '')

    const databaseModule = await import('@/lib/db')

    expect(() => databaseModule.db.select).toThrow(
      'DATABASE_URL or DATABASE_RESTRICTED_URL environment variable is not set'
    )
  })

  it('falls back to DATABASE_URL when the restricted URL is empty', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DATABASE_URL', 'postgres://user:pass@localhost:5432/testdb')
    vi.stubEnv('DATABASE_RESTRICTED_URL', '')

    const databaseModule = await import('@/lib/db')

    expect(() => databaseModule.db.select).not.toThrow()
  })

  it('uses getDatabaseSslConfig so hosted TLS does not require a public CA', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DATABASE_URL', 'postgres://user:pass@localhost:5432/testdb')
    vi.stubEnv('DATABASE_RESTRICTED_URL', '')
    vi.stubEnv('DATABASE_SSL_DISABLED', '')
    vi.stubEnv('DATABASE_SSL_REJECT_UNAUTHORIZED', '')

    const postgres = vi.fn(() => ({}))
    vi.doMock('postgres', () => ({ default: postgres }))
    vi.doMock('drizzle-orm/postgres-js', () => ({
      drizzle: (client: unknown) => client
    }))

    await import('@/lib/db')

    expect(postgres).toHaveBeenCalledWith(
      'postgres://user:pass@localhost:5432/testdb',
      expect.objectContaining({
        ssl: { rejectUnauthorized: false }
      })
    )
  })
})
