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

describe('jwt compatibility', () => {
    it('issues and verifies jwt with legacy claim URIs', async () => {
        const { generateJwt, verifyJwt } = await import('#/lib/auth/jwt')

        const token = generateJwt({
            userId: '00000000-0000-0000-0000-000000000001',
            email: 'user@example.com',
            originalUsername: 'UserOne',
        })

        const payload = verifyJwt(token)

        expect(
            payload[
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
            ],
        ).toBe('00000000-0000-0000-0000-000000000001')
        expect(
            payload[
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
            ],
        ).toBe('user@example.com')
        expect(
            payload[
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
            ],
        ).toBe('UserOne')
        expect(
            payload[
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
            ],
        ).toBe('User')
    })
})
