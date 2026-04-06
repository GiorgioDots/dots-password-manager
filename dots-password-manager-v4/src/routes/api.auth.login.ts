import { eq, or } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/db'
import { refreshTokens, users } from '#/db/schema'
import type { AuthTokenResponse, LoginRequest } from '#/lib/auth/contracts'
import { authConfig } from '#/lib/auth/config'
import { generateJwt } from '#/lib/auth/jwt'
import { verifyPasswordWithSalt } from '#/lib/auth/password-hash'
import { generateRefreshToken } from '#/lib/auth/refresh-token'

function badRequest(message: string, status = 400): Response {
  return Response.json({ Message: message }, { status })
}

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Partial<LoginRequest>
        const login = body.Login?.trim()
        const password = body.Password

        if (!login || login.length < 2 || !password) {
          return badRequest('Invalid request.')
        }

        const loweredLogin = login.toLowerCase()
        const user = await db.query.users.findFirst({
          where: or(eq(users.email, loweredLogin), eq(users.username, loweredLogin)),
        })

        if (
          !user ||
          !verifyPasswordWithSalt(password, user.passwordSalt, user.passwordHash)
        ) {
          return badRequest('Invalid credentials.')
        }

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
            Date.now() + authConfig.jwtRefreshTokenExpDays * 24 * 60 * 60 * 1000,
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