import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import type {
    AuthMessageResponse,
    AuthSessionResponse,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    ResetPasswordRequestRequest,
} from '#/lib/shared/auth/contracts'

const PASSWORD_RESET = 'PASSWORD_RESET'
const INVALID_RESET_REQUEST_MESSAGE = 'The request is expired or not valid'

function asMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message
    }

    return fallback
}

export const loginServerFn = createServerFn({ method: 'POST' })
    .inputValidator((input: LoginRequest) => input)
    .handler(async ({ data }): Promise<AuthSessionResponse> => {
        const [{ eq, or }, { db }, { refreshTokens: sessionTokens, users }] = await Promise.all([
            import('drizzle-orm'),
            import('#/lib/server/db'),
            import('#/lib/server/db/schema'),
        ])
        const [{ authConfig }, { verifyPasswordWithSalt }, { generateSessionToken }] =
            await Promise.all([
                import('#/lib/server/auth/config'),
                import('#/lib/server/auth/password-hash'),
                import('#/lib/server/auth/session-token'),
            ])

        const login = data.Login.trim()
        const password = data.Password

        if (!login || login.length < 2 || !password) {
            throw new Error('Invalid request.')
        }

        const loweredLogin = login.toLowerCase()
        const user = await db.query.users.findFirst({
            where: or(eq(users.email, loweredLogin), eq(users.username, loweredLogin)),
        })

        if (!user || !verifyPasswordWithSalt(password, user.passwordSalt, user.passwordHash)) {
            throw new Error('Invalid credentials.')
        }

        const sessionToken = generateSessionToken()
        await db.insert(sessionTokens).values({
            userId: user.id,
            token: sessionToken,
            expiresAt: new Date(Date.now() + authConfig.sessionTokenExpDays * 24 * 60 * 60 * 1000),
        })

        const { setSessionTokenCookie } = await import('#/lib/server/auth/session')
        setSessionTokenCookie(sessionToken)

        return {
            LoggedIn: true,
        }
    })

export const registerServerFn = createServerFn({ method: 'POST' })
    .inputValidator((input: RegisterRequest) => input)
    .handler(async ({ data }): Promise<AuthSessionResponse> => {
        const [{ eq }, { randomBytes }, { db }, { refreshTokens: sessionTokens, users }] =
            await Promise.all([
                import('drizzle-orm'),
                import('node:crypto'),
                import('#/lib/server/db'),
                import('#/lib/server/db/schema'),
            ])
        const [
            { authConfig },
            { sendWelcomeEmail },
            { generatePasswordSalt, hashPasswordWithSalt },
            { generateSessionToken },
        ] = await Promise.all([
            import('#/lib/server/auth/config'),
            import('#/lib/server/email/service'),
            import('#/lib/server/auth/password-hash'),
            import('#/lib/server/auth/session-token'),
        ])

        const email = data.Email.trim()
        const username = data.Username.trim()
        const password = data.Password

        if (!email || !username || !password) {
            throw new Error('Invalid request.')
        }

        if (username.length < 3 || password.length < 6) {
            throw new Error('Invalid request.')
        }

        const emailIsTaken = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase()),
            columns: { id: true },
        })
        if (emailIsTaken) {
            throw new Error('Email is already taken.')
        }

        const usernameIsTaken = await db.query.users.findFirst({
            where: eq(users.username, username.toLowerCase()),
            columns: { id: true },
        })
        if (usernameIsTaken) {
            throw new Error('Username is already taken.')
        }

        const passwordSalt = generatePasswordSalt()
        const passwordHash = hashPasswordWithSalt(password, passwordSalt)
        const userSalt = randomBytes(16).toString('base64')

        const insertedUsers = await db
            .insert(users)
            .values({
                email,
                username: username.toLowerCase(),
                originalUsername: username,
                passwordHash,
                passwordSalt,
                salt: userSalt,
            })
            .returning({
                id: users.id,
                email: users.email,
                originalUsername: users.originalUsername,
            })

        const user = insertedUsers[0]

        await sendWelcomeEmail({
            email: user.email,
            originalUsername: user.originalUsername,
        })

        const sessionToken = generateSessionToken()
        await db.insert(sessionTokens).values({
            userId: user.id,
            token: sessionToken,
            expiresAt: new Date(Date.now() + authConfig.sessionTokenExpDays * 24 * 60 * 60 * 1000),
        })

        const { setSessionTokenCookie } = await import('#/lib/server/auth/session')
        setSessionTokenCookie(sessionToken)

        return {
            LoggedIn: true,
        }
    })

export const getAuthSessionServerFn = createServerFn({ method: 'GET' }).handler(
    async (): Promise<{ LoggedIn: boolean }> => {
        const [{ getSessionUser }] = await Promise.all([import('#/lib/server/auth/session')])

        const user = await getSessionUser(getRequest())
        return {
            LoggedIn: Boolean(user),
        }
    },
)

export const logoutServerFn = createServerFn({ method: 'POST' }).handler(
    async (): Promise<AuthMessageResponse> => {
        const [{ clearSessionCookie, getSessionTokenFromRequest, revokeSessionToken }] =
            await Promise.all([import('#/lib/server/auth/session')])

        const sessionToken = getSessionTokenFromRequest(getRequest())
        await revokeSessionToken(sessionToken)
        clearSessionCookie()

        return {
            Message: 'Logged out successfully',
        }
    },
)

export const requestPasswordResetServerFn = createServerFn({ method: 'POST' })
    .inputValidator((input: ResetPasswordRequestRequest) => input)
    .handler(async ({ data }): Promise<AuthMessageResponse> => {
        const [{ eq }, { db }, { userRequests, users }, { sendPasswordResetRequestEmail }] =
            await Promise.all([
                import('drizzle-orm'),
                import('#/lib/server/db'),
                import('#/lib/server/db/schema'),
                import('#/lib/server/email/service'),
            ])

        const email = data.Email.trim()
        if (!email || !email.includes('@')) {
            throw new Error('Invalid request.')
        }

        const response: AuthMessageResponse = {
            Message:
                'Check your emails and click the link to continue, the request will be valid for the next 10 minutes',
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
            columns: { id: true, email: true, originalUsername: true },
        })

        if (!user) {
            return response
        }

        const createdRequests = await db
            .insert(userRequests)
            .values({
                userId: user.id,
                requestType: PASSWORD_RESET,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                createdAt: new Date(),
            })
            .returning({ id: userRequests.id })

        const createdRequest = createdRequests[0]

        await sendPasswordResetRequestEmail(
            {
                email: user.email,
                originalUsername: user.originalUsername,
            },
            createdRequest.id,
        )

        return response
    })

export const validatePasswordResetRequestServerFn = createServerFn({
    method: 'GET',
})
    .inputValidator((input: { RequestId: string }) => input)
    .handler(async ({ data }): Promise<AuthMessageResponse> => {
        const [{ and, eq, gt }, { db }, { userRequests }] = await Promise.all([
            import('drizzle-orm'),
            import('#/lib/server/db'),
            import('#/lib/server/db/schema'),
        ])

        const requestId = data.RequestId.trim()

        if (!requestId) {
            throw new Error('Invalid request.')
        }

        const requestRow = await db.query.userRequests.findFirst({
            where: and(
                eq(userRequests.id, requestId),
                gt(userRequests.expiresAt, new Date()),
                eq(userRequests.requestType, PASSWORD_RESET),
            ),
            columns: { id: true },
        })

        if (!requestRow) {
            throw new Error(INVALID_RESET_REQUEST_MESSAGE)
        }

        return { Message: 'Request is valid.' }
    })

export const resetPasswordServerFn = createServerFn({ method: 'POST' })
    .inputValidator((input: ResetPasswordRequest) => input)
    .handler(async ({ data }): Promise<AuthMessageResponse> => {
        const [{ and, eq, gt }, { db }, { userRequests, users }] = await Promise.all([
            import('drizzle-orm'),
            import('#/lib/server/db'),
            import('#/lib/server/db/schema'),
        ])
        const [{ sendPasswordResettedEmail }, { hashPasswordWithSalt }] = await Promise.all([
            import('#/lib/server/email/service'),
            import('#/lib/server/auth/password-hash'),
        ])

        const requestId = data.RequestId.trim()
        const newPassword = data.NewPassword

        if (!requestId || !newPassword || newPassword.length < 6) {
            throw new Error('Invalid request.')
        }

        const requestRow = await db.query.userRequests.findFirst({
            where: and(
                eq(userRequests.id, requestId),
                gt(userRequests.expiresAt, new Date()),
                eq(userRequests.requestType, PASSWORD_RESET),
            ),
        })

        if (!requestRow) {
            throw new Error(INVALID_RESET_REQUEST_MESSAGE)
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, requestRow.userId),
            columns: {
                id: true,
                email: true,
                originalUsername: true,
                passwordSalt: true,
            },
        })

        if (!user) {
            throw new Error(INVALID_RESET_REQUEST_MESSAGE)
        }

        const passwordHash = hashPasswordWithSalt(newPassword, user.passwordSalt)

        await db.update(users).set({ passwordHash }).where(eq(users.id, user.id))

        await db
            .update(userRequests)
            .set({ expiresAt: new Date() })
            .where(eq(userRequests.id, requestRow.id))

        await sendPasswordResettedEmail({
            email: user.email,
            originalUsername: user.originalUsername,
        })

        return {
            Message: 'Your password has been resetted, please login again',
        }
    })

export function getErrorMessage(error: unknown, fallback: string): string {
    return asMessage(error, fallback)
}
