import { afterEach, describe, expect, it } from 'vitest'

import { getDatabaseSslConfig } from '../ssl'

describe('getDatabaseSslConfig', () => {
  const originalDisabled = process.env.DATABASE_SSL_DISABLED
  const originalRejectUnauthorized =
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED

  afterEach(() => {
    if (originalDisabled === undefined) {
      delete process.env.DATABASE_SSL_DISABLED
    } else {
      process.env.DATABASE_SSL_DISABLED = originalDisabled
    }

    if (originalRejectUnauthorized === undefined) {
      delete process.env.DATABASE_SSL_REJECT_UNAUTHORIZED
    } else {
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED = originalRejectUnauthorized
    }
  })

  it('disables SSL when DATABASE_SSL_DISABLED is true', () => {
    process.env.DATABASE_SSL_DISABLED = 'true'
    delete process.env.DATABASE_SSL_REJECT_UNAUTHORIZED

    expect(getDatabaseSslConfig()).toBe(false)
  })

  it('uses SSL without CA verification by default', () => {
    delete process.env.DATABASE_SSL_DISABLED
    delete process.env.DATABASE_SSL_REJECT_UNAUTHORIZED

    expect(getDatabaseSslConfig()).toEqual({ rejectUnauthorized: false })
  })

  it('verifies certificates when DATABASE_SSL_REJECT_UNAUTHORIZED is true', () => {
    delete process.env.DATABASE_SSL_DISABLED
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED = 'true'

    expect(getDatabaseSslConfig()).toEqual({ rejectUnauthorized: true })
  })

  it('still disables SSL entirely when both flags are set', () => {
    process.env.DATABASE_SSL_DISABLED = 'true'
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED = 'true'

    expect(getDatabaseSslConfig()).toBe(false)
  })
})
