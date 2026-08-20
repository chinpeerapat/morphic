import { describe, expect, it } from 'vitest'

import { getDatabaseSslConfig } from '../ssl'

describe('getDatabaseSslConfig', () => {
  it('disables SSL when DATABASE_SSL_DISABLED is true', () => {
    expect(getDatabaseSslConfig({ DATABASE_SSL_DISABLED: 'true' })).toBe(false)
  })

  it('uses SSL without CA verification by default', () => {
    expect(getDatabaseSslConfig({})).toEqual({ rejectUnauthorized: false })
  })

  it('verifies certificates when DATABASE_SSL_REJECT_UNAUTHORIZED is true', () => {
    expect(
      getDatabaseSslConfig({ DATABASE_SSL_REJECT_UNAUTHORIZED: 'true' })
    ).toEqual({ rejectUnauthorized: true })
  })

  it('still disables SSL entirely when both flags are set', () => {
    expect(
      getDatabaseSslConfig({
        DATABASE_SSL_DISABLED: 'true',
        DATABASE_SSL_REJECT_UNAUTHORIZED: 'true'
      })
    ).toBe(false)
  })
})
