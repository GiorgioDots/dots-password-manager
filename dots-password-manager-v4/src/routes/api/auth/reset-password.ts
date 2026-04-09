import { and, eq, gt } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/db'
import { userRequests, users } from '#/db/schema'
import type {
    AuthMessageResponse,
    ResetPasswordRequest,
} from '#/lib/shared/auth/contracts'
import { sendPasswordResettedEmail } from '#/lib/server/email/service'
import { hashPasswordWithSalt } from '#/lib/server/auth/password-hash'

const PASSWORD_RESET = 'PASSWORD_RESET'
const INVALID_REQUEST_MESSAGE = 'The request is expired or not valid'

function badRequest(message: string, status = 400): Response {
    return Response.json({ Message: message }, { status })
}

export const Route = createFileRoute('/api/auth/reset-password')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                const queryString = request.url.includes('?')
                    ? request.url.slice(request.url.indexOf('?') + 1)
                    : ''
                const requestId = new URLSearchParams(queryString)
                    .get('r')
                    ?.trim()

                if (!requestId) {
                    return badRequest('Invalid request.')
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
                    return badRequest(INVALID_REQUEST_MESSAGE)
                }

                return Response.json({ Message: 'Request is valid.' })
            },
            POST: async ({ request }) => {
                const body =
                    (await request.json()) as Partial<ResetPasswordRequest>
                const requestId = body.RequestId?.trim()
                const newPassword = body.NewPassword

                if (!requestId || !newPassword || newPassword.length < 6) {
                    return badRequest('Invalid request.')
                }

                const requestRow = await db.query.userRequests.findFirst({
                    where: and(
                        eq(userRequests.id, requestId),
                        gt(userRequests.expiresAt, new Date()),
                        eq(userRequests.requestType, PASSWORD_RESET),
                    ),
                })

                if (!requestRow) {
                    return badRequest(INVALID_REQUEST_MESSAGE)
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
                    return badRequest(INVALID_REQUEST_MESSAGE)
                }

                const passwordHash = hashPasswordWithSalt(
                    newPassword,
                    user.passwordSalt,
                )

                await db
                    .update(users)
                    .set({ passwordHash })
                    .where(eq(users.id, user.id))

                await db
                    .update(userRequests)
                    .set({ expiresAt: new Date() })
                    .where(eq(userRequests.id, requestRow.id))

                await sendPasswordResettedEmail({
                    email: user.email,
                    originalUsername: user.originalUsername,
                })

                const response: AuthMessageResponse = {
                    Message:
                        'Your password has been resetted, please login again',
                }

                return Response.json(response)
            },
        },
    },
})
