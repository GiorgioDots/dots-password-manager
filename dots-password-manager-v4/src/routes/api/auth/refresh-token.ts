import { and, eq, isNull } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/db'
import { refreshTokens, users } from '#/db/schema'
import type {
    AuthTokenResponse,
    RefreshTokenRequest,
} from '#/lib/shared/auth/contracts'
import { authConfig } from '#/lib/server/auth/config'
import { generateJwt } from '#/lib/server/auth/jwt'
import { generateRefreshToken } from '#/lib/server/auth/refresh-token'

function errorResponse(message: string, status: number): Response {
    return Response.json({ Message: message }, { status })
}

export const Route = createFileRoute('/api/auth/refresh-token')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const body =
                    (await request.json()) as Partial<RefreshTokenRequest>
                const token = body.Token?.trim()

                if (!token) {
                    return errorResponse('Invalid request.', 400)
                }

                const existingToken = await db.query.refreshTokens.findFirst({
                    where: and(
                        eq(refreshTokens.token, token),
                        isNull(refreshTokens.revokedAt),
                    ),
                })

                if (!existingToken || existingToken.expiresAt <= new Date()) {
                    return errorResponse(
                        'Invalid or expired refresh token.',
                        422,
                    )
                }

                const user = await db.query.users.findFirst({
                    where: eq(users.id, existingToken.userId),
                })
                if (!user) {
                    return errorResponse('User not found.', 422)
                }

                const newJwt = generateJwt({
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
                    expiresAt: new Date(
                        Date.now() +
                            authConfig.jwtRefreshTokenExpDays *
                                24 *
                                60 *
                                60 *
                                1000,
                    ),
                })

                const response: AuthTokenResponse = {
                    Token: newJwt,
                    RefreshToken: newRefreshToken,
                }

                return Response.json(response)
            },
        },
    },
})
