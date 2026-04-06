import { describe, expect, it } from 'vitest'

import { verifyPasswordWithSalt } from '#/lib/auth/password-hash'

describe('password hash compatibility', () => {
  it('verifies a known bcrypt salt/hash pair', () => {
    const salt = '$2b$10$CwTycUXWue0Thq9StjUM0u'
    const expectedHash =
      '$2b$10$CwTycUXWue0Thq9StjUM0ufAwiHylND31x4P/qHYAr.lOt2Y1w7p2'

    expect(verifyPasswordWithSalt('test1234', salt, expectedHash)).toBe(true)
    expect(verifyPasswordWithSalt('wrong-password', salt, expectedHash)).toBe(
      false,
    )
  })
})
