import { eq } from 'drizzle-orm'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'

import { db } from '#/lib/server/db'
import { refreshTokens, users } from '#/lib/server/db/schema'
import { verifyJwt } from '#/lib/server/auth/jwt'
import { authConfig } from '#/lib/server/auth/config'

const CLAIM_NAME_ID = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
const AUTH_ACCESS_TOKEN_COOKIE = 'dpm_access_token'
const AUTH_REFRESH_TOKEN_COOKIE = 'dpm_refresh_token'

type SessionUser = {
    id: string
    email: string
    username: string
    originalUsername: string
    salt: string
    passwordSalt: string
    passwordHash: string
}

type SessionTokens = {
    accessToken: string | null
    refreshToken: string
}

type CookieSessionTokens = {
    accessToken: string
    refreshToken: string
}

function getBearerToken(request: Request): string | null {
    const auth = request.headers.get('authorization')
    if (!auth) return null

    const [scheme, token] = auth.split(' ')
    if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
        return null
    }

    return token
}

function getTokenFromCookieHeader(cookieHeader: string | null, cookieName: string): string | null {
    if (!cookieHeader) {
        return null
    }

    for (const pair of cookieHeader.split(';')) {
        const [key, ...rest] = pair.trim().split('=')
        if (key !== cookieName) {
            continue
        }

        return decodeURIComponent(rest.join('='))
    }

    return null
}

function getSessionTokens(request: Request): SessionTokens | null {
    const accessToken =
        getTokenFromCookieHeader(request.headers.get('cookie'), AUTH_ACCESS_TOKEN_COOKIE) ??
        getCookie(AUTH_ACCESS_TOKEN_COOKIE) ??
        null
    const refreshToken =
        getTokenFromCookieHeader(request.headers.get('cookie'), AUTH_REFRESH_TOKEN_COOKIE) ??
        getCookie(AUTH_REFRESH_TOKEN_COOKIE) ??
        null

    if (!refreshToken) {
        return null
    }

    return {
        accessToken,
        refreshToken,
    }
}

export function setSessionCookies(tokens: CookieSessionTokens): void {
    const isProd = process.env.NODE_ENV === 'production'

    setCookie(AUTH_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: authConfig.jwtExpMinutes * 60,
    })

    setCookie(AUTH_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: authConfig.jwtRefreshTokenExpDays * 24 * 60 * 60,
    })
}

export function clearSessionCookies(): void {
    deleteCookie(AUTH_ACCESS_TOKEN_COOKIE, { path: '/' })
    deleteCookie(AUTH_REFRESH_TOKEN_COOKIE, { path: '/' })
}

async function getUserById(userId: string): Promise<SessionUser | null> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            id: true,
            email: true,
            username: true,
            originalUsername: true,
            salt: true,
            passwordSalt: true,
            passwordHash: true,
        },
    })

    return user ?? null
}

async function getSessionUserFromAccessToken(accessToken: string): Promise<SessionUser | null> {
    try {
        const payload = verifyJwt(accessToken)
        const userId = payload[CLAIM_NAME_ID]

        if (typeof userId !== 'string') {
            return null
        }

        return getUserById(userId)
    } catch {
        return null
    }
}

async function refreshSessionUser(refreshToken: string): Promise<SessionUser | null> {
    const [{ and, isNull }, { generateJwt }, { generateRefreshToken }] = await Promise.all([
        import('drizzle-orm'),
        import('#/lib/server/auth/jwt'),
        import('#/lib/server/auth/refresh-token'),
    ])

    const existingToken = await db.query.refreshTokens.findFirst({
        where: and(eq(refreshTokens.token, refreshToken), isNull(refreshTokens.revokedAt)),
    })

    if (!existingToken || existingToken.expiresAt <= new Date()) {
        return null
    }

    const user = await getUserById(existingToken.userId)
    if (!user) {
        return null
    }

    const newAccessToken = generateJwt({
        userId: user.id,
        email: user.email,
        originalUsername: user.originalUsername,
    })
    const newRefreshToken = generateRefreshToken()

    await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.id, existingToken.id))

    await db.insert(refreshTokens).values({
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + authConfig.jwtRefreshTokenExpDays * 24 * 60 * 60 * 1000),
    })

    setSessionCookies({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    })

    return user
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
    const token = getBearerToken(request)
    if (token) {
        const user = await getSessionUserFromAccessToken(token)
        if (user) {
            return user
        }
    }

    const tokens = getSessionTokens(request)
    if (!tokens) {
        return null
    }

    const user = tokens.accessToken ? await getSessionUserFromAccessToken(tokens.accessToken) : null

    if (user) {
        return user
    }

    return refreshSessionUser(tokens.refreshToken)
}

export async function revokeRefreshToken(token: string | null | undefined): Promise<void> {
    if (!token) {
        return
    }

    await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.token, token))
}

export function getRefreshTokenFromRequest(request: Request): string | null {
    return (
        getTokenFromCookieHeader(request.headers.get('cookie'), AUTH_REFRESH_TOKEN_COOKIE) ??
        getCookie(AUTH_REFRESH_TOKEN_COOKIE) ??
        null
    )
}

export function unauthorizedResponse(): Response {
    return Response.json({ Message: 'Unauthorized' }, { status: 401 })
}
