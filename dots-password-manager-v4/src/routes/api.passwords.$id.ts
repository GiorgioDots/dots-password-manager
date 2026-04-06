import { and, eq } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/db'
import { savedPasswords } from '#/db/schema'
import { getSessionUser, unauthorizedResponse } from '#/lib/auth/session'
import { getPublicKeyHeader } from '#/lib/crypto/client-public-key'
import { toSavedPasswordResponse } from '#/lib/passwords/mapper'

function badRequest(message: string, status = 400): Response {
  return Response.json({ Message: message }, { status })
}

export const Route = createFileRoute('/api/passwords/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const user = await getSessionUser(request)
        if (!user) {
          return unauthorizedResponse()
        }

        const password = await db.query.savedPasswords.findFirst({
          where: and(
            eq(savedPasswords.userId, user.id),
            eq(savedPasswords.id, params.id),
          ),
        })

        if (!password) {
          return badRequest('Not Found')
        }

        return Response.json(
          toSavedPasswordResponse(password, user, getPublicKeyHeader(request)),
        )
      },
      DELETE: async ({ request, params }) => {
        const user = await getSessionUser(request)
        if (!user) {
          return unauthorizedResponse()
        }

        const password = await db.query.savedPasswords.findFirst({
          where: and(
            eq(savedPasswords.userId, user.id),
            eq(savedPasswords.id, params.id),
          ),
          columns: { id: true },
        })

        if (!password) {
          return badRequest('Not Found')
        }

        await db
          .delete(savedPasswords)
          .where(eq(savedPasswords.id, password.id))

        return Response.json({ Message: 'Password deleted' })
      },
    },
  },
})
