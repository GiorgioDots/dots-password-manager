import { eq } from 'drizzle-orm'
import { randomBytes } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/lib/server/db'
import { refreshTokens, users } from '#/lib/server/db/schema'
import type {
    AuthTokenResponse,
    RegisterRequest,
} from '#/lib/shared/auth/contracts'
import { authConfig } from '#/lib/server/auth/config'
import { generateJwt } from '#/lib/server/auth/jwt'
import { sendWelcomeEmail } from '#/lib/server/email/service'
import {
    generatePasswordSalt,
    hashPasswordWithSalt,
} from '#/lib/server/auth/password-hash'
import { generateRefreshToken } from '#/lib/server/auth/refresh-token'

function badRequest(message: string, status = 400): Response {
    return Response.json({ Message: message }, { status })
}

export const Route = createFileRoute('/api/auth/register')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const body = (await request.json()) as Partial<RegisterRequest>

                const email = body.Email?.trim()
                const username = body.Username?.trim()
                const password = body.Password

                if (!email || !username || !password) {
                    return badRequest('Invalid request.')
                }

                if (username.length < 3 || password.length < 6) {
                    return badRequest('Invalid request.')
                }

                const emailIsTaken = await db.query.users.findFirst({
                    where: eq(users.email, email.toLowerCase()),
                    columns: { id: true },
                })
                if (emailIsTaken) {
                    return badRequest('Email is already taken.')
                }

                const usernameIsTaken = await db.query.users.findFirst({
                    where: eq(users.username, username.toLowerCase()),
                    columns: { id: true },
                })
                if (usernameIsTaken) {
                    return badRequest('Username is already taken.')
                }

                const passwordSalt = generatePasswordSalt()
                const passwordHash = hashPasswordWithSalt(
                    password,
                    passwordSalt,
                )
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

                const jwt = generateJwt({
                    userId: user.id,
                    email: user.email,
                    originalUsername: user.originalUsername,
                })

                const refreshToken = generateRefreshToken()
                await db.insert(refreshTokens).values({
                    userId: user.id,
                    token: refreshToken,
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
                    Token: jwt,
                    RefreshToken: refreshToken,
                }

                return Response.json(response)
            },
        },
    },
})
