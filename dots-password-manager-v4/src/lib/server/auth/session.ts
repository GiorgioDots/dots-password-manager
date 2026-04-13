import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import { and, eq, isNull } from 'drizzle-orm'

import { authConfig } from '#/lib/server/auth/config'
import { db } from '#/lib/server/db'
import { refreshTokens as sessionTokens, users } from '#/lib/server/db/schema'

function getSessionTokenCookieName(): string {
    return 'dpm_session_token'
}

function getLegacyRefreshTokenCookieName(): string {
    return 'dpm_refresh_token'
}

type SessionUser = {
    id: string
    email: string
    username: string
    originalUsername: string
    salt: string
    passwordSalt: string
    passwordHash: string
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

function readSessionToken(request: Request): string | null {
    const sessionCookieName = getSessionTokenCookieName()
    const legacyCookieName = getLegacyRefreshTokenCookieName()

    return (
        getTokenFromCookieHeader(request.headers.get('cookie'), sessionCookieName) ??
        getCookie(sessionCookieName) ??
        getTokenFromCookieHeader(request.headers.get('cookie'), legacyCookieName) ??
        getCookie(legacyCookieName) ??
        null
    )
}

export function setSessionTokenCookie(sessionToken: string): void {
    const isProd = process.env.NODE_ENV === 'production'

    setCookie(getSessionTokenCookieName(), sessionToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: authConfig.sessionTokenExpDays * 24 * 60 * 60,
    })
}

export function clearSessionCookie(): void {
    deleteCookie(getSessionTokenCookieName(), { path: '/' })
    deleteCookie(getLegacyRefreshTokenCookieName(), { path: '/' })
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

async function getSessionUserFromSessionToken(sessionToken: string): Promise<SessionUser | null> {
    const existingToken = await db.query.refreshTokens.findFirst({
        where: and(eq(sessionTokens.token, sessionToken), isNull(sessionTokens.revokedAt)),
    })

    if (!existingToken || existingToken.expiresAt <= new Date()) {
        return null
    }

    return getUserById(existingToken.userId)
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
    const sessionToken = readSessionToken(request)
    if (!sessionToken) {
        return null
    }

    return getSessionUserFromSessionToken(sessionToken)
}

export async function revokeSessionToken(token: string | null | undefined): Promise<void> {
    if (!token) {
        return
    }

    await db
        .update(sessionTokens)
        .set({ revokedAt: new Date() })
        .where(eq(sessionTokens.token, token))
}

export function getSessionTokenFromRequest(request: Request): string | null {
    return readSessionToken(request)
}

export function unauthorizedResponse(): Response {
    return Response.json({ Message: 'Unauthorized' }, { status: 401 })
}
