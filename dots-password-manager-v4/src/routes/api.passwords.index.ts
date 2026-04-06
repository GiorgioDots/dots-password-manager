import { and, eq } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/db'
import { savedPasswords } from '#/db/schema'
import { getSessionUser, unauthorizedResponse } from '#/lib/auth/session'
import { toSavedPasswordListResponse } from '#/lib/passwords/mapper'

export const Route = createFileRoute('/api/passwords/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request)
        if (!user) {
          return unauthorizedResponse()
        }

        const passwords = await db.query.savedPasswords.findMany({
          where: eq(savedPasswords.userId, user.id),
        })

        return Response.json(passwords.map(toSavedPasswordListResponse))
      },
    },
  },
})
