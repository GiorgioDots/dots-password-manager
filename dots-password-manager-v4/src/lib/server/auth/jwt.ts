import jwt from 'jsonwebtoken'

import { authConfig } from '#/lib/server/auth/config'

const CLAIM_NAME_ID = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
const CLAIM_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

export type AuthUserClaims = {
    userId: string
    email: string
    originalUsername: string
}

export function generateJwt(claims: AuthUserClaims): string {
    return jwt.sign(
        {
            [CLAIM_NAME_ID]: claims.userId,
            [CLAIM_EMAIL]: claims.email,
            [CLAIM_NAME]: claims.originalUsername,
            [CLAIM_ROLE]: 'User',
        },
        authConfig.jwtSecret,
        {
            expiresIn: `${authConfig.jwtExpMinutes}m`,
            issuer: authConfig.jwtIssuer,
            audience: authConfig.jwtAudience,
            algorithm: 'HS256',
        },
    )
}

export function verifyJwt(token: string): jwt.JwtPayload {
    return jwt.verify(token, authConfig.jwtSecret, {
        audience: authConfig.jwtAudience,
        issuer: authConfig.jwtIssuer,
        clockTolerance: 0,
        algorithms: ['HS256'],
    }) as jwt.JwtPayload
}
