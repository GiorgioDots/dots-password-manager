import { eq } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/db'
import { userRequests, users } from '#/db/schema'
import type {
  AuthMessageResponse,
  ResetPasswordRequestRequest,
} from '#/lib/auth/contracts'
import { sendPasswordResetRequestEmail } from '#/lib/email/service'

const PASSWORD_RESET = 'PASSWORD_RESET'
const SUCCESS_MESSAGE =
  'Check your emails and click the link to continue, the request will be valid for the next 10 minutes'

function badRequest(message: string, status = 400): Response {
  return Response.json({ Message: message }, { status })
}

export const Route = createFileRoute('/api/auth/reset-password-request')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body =
          (await request.json()) as Partial<ResetPasswordRequestRequest>
        const email = body.Email?.trim()

        if (!email || !email.includes('@')) {
          return badRequest('Invalid request.')
        }

        const response: AuthMessageResponse = {
          Message: SUCCESS_MESSAGE,
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
          columns: { id: true, email: true, originalUsername: true },
        })

        if (!user) {
          return Response.json(response)
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

        return Response.json(response)
      },
    },
  },
})
