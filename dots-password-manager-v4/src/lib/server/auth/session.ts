/**
 * Session helpers — now backed by Better Auth.
 * getSessionUser is kept for backward compat with the passwords API server functions
 * which need vault-critical fields (salt etc.) that aren't in the BA session.
 */

import { eq } from 'drizzle-orm'

import { auth } from '#/lib/server/auth/better-auth'
import { db } from '#/lib/server/db'
import { users } from '#/lib/server/db/schema'

export type SessionUser = {
    id: string
    email: string
    username: string
    originalUsername: string
    salt: string
    passwordSalt: string
    passwordHash: string
}

/**
 * Resolves the current request's session and returns the user with vault fields.
 * Returns null if the request is unauthenticated.
 */
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
        return null
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
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

export function unauthorizedResponse(): Response {
    return Response.json({ Message: 'Unauthorized' }, { status: 401 })
}
