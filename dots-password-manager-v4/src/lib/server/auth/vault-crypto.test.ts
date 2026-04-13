import { createCipheriv, pbkdf2Sync } from 'node:crypto'

import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
    vi.resetModules()
    process.env.JWT_SECRET = 'test-jwt-secret'
    process.env.JWT_ISSUER = 'dots-tests'
    process.env.JWT_AUDIENCE = 'dots-client-tests'
    process.env.JWT_EXP_MINUTES = '60'
    process.env.JWT_REFRESH_TOKEN_EXP_DAYS = '30'
    process.env.CRYPTO_BASE_64_KEY = 'ZmFrZS1iYXNlNjQta2V5LXN0cmluZw=='
})

describe('vault crypto compatibility', () => {
    it('matches expected deterministic ciphertext for known vector', async () => {
        const { encryptWithUserSalt } = await import('#/lib/server/auth/vault-crypto')

        const encrypted = encryptWithUserSalt('P@ssw0rd-legacy', 'MDEyMzQ1Njc4OWFiY2RlZg==')

        expect(encrypted).toBe('jmgWnHd0FClCC8QPSoUhHQ==')
    })

    it('decrypts previously encrypted values', async () => {
        const { decryptWithUserSalt } = await import('#/lib/server/auth/vault-crypto')

        const plain = decryptWithUserSalt('jmgWnHd0FClCC8QPSoUhHQ==', 'MDEyMzQ1Njc4OWFiY2RlZg==')

        expect(plain).toBe('P@ssw0rd-legacy')
    })

    it('decrypts values encrypted with newline-terminated key material', async () => {
        const { decryptWithUserSalt } = await import('#/lib/server/auth/vault-crypto')

        const legacyKeyWithNewline = `${process.env.CRYPTO_BASE_64_KEY}\n`
        const saltBase64 = 'MDEyMzQ1Njc4OWFiY2RlZg=='
        const salt = Buffer.from(saltBase64, 'base64')
        const derived = pbkdf2Sync(legacyKeyWithNewline, salt, 100_000, 48, 'sha256')
        const key = derived.subarray(0, 32)
        const iv = derived.subarray(32, 48)
        const cipher = createCipheriv('aes-256-cbc', key, iv)
        const encrypted = Buffer.concat([
            cipher.update('legacy-newline-key', 'utf8'),
            cipher.final(),
        ]).toString('base64')

        const plain = decryptWithUserSalt(encrypted, saltBase64)

        expect(plain).toBe('legacy-newline-key')
    })
})
