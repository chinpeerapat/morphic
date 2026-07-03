import { describe, expect, it } from 'vitest'

import { resolveDatabaseConnectionString } from '../connection-string'

describe('resolveDatabaseConnectionString', () => {
  it('prefers DATABASE_RESTRICTED_URL over DATABASE_URL', () => {
    expect(
      resolveDatabaseConnectionString({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgres://owner@localhost:5432/db',
        DATABASE_RESTRICTED_URL: 'postgres://app_user@localhost:5432/db'
      })
    ).toBe('postgres://app_user@localhost:5432/db')
  })

  it('uses a placeholder during production build when unset', () => {
    expect(
      resolveDatabaseConnectionString({
        NODE_ENV: 'production',
        NEXT_PHASE: 'phase-production-build'
      })
    ).toContain('127.0.0.1:5432/build')
  })

  it('throws at runtime when unset outside build and test', () => {
    expect(() =>
      resolveDatabaseConnectionString({
        NODE_ENV: 'production'
      })
    ).toThrow(
      'DATABASE_URL or DATABASE_RESTRICTED_URL environment variable is not set'
    )
  })

  it('uses the test connection string in test mode', () => {
    expect(
      resolveDatabaseConnectionString({
        NODE_ENV: 'test'
      })
    ).toBe('postgres://user:pass@localhost:5432/testdb')
  })
})
