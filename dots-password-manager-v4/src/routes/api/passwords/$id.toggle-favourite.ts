import { and, eq } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/lib/server/db'
import { savedPasswords } from '#/lib/server/db/schema'
import { getSessionUser, unauthorizedResponse } from '#/lib/server/auth/session'

function badRequest(message: string, status = 400): Response {
    return Response.json({ Message: message }, { status })
}

export const Route = createFileRoute('/api/passwords/$id/toggle-favourite')({
    server: {
        handlers: {
            GET: async ({ request, params }) => {
                const user = await getSessionUser(request)
                if (!user) {
                    return unauthorizedResponse()
                }

                const existing = await db.query.savedPasswords.findFirst({
                    where: and(
                        eq(savedPasswords.userId, user.id),
                        eq(savedPasswords.id, params.id),
                    ),
                })

                if (!existing) {
                    return badRequest('Not Found')
                }

                const updated = await db
                    .update(savedPasswords)
                    .set({
                        isFavourite: !existing.isFavourite,
                        updatedAt: new Date(),
                    })
                    .where(eq(savedPasswords.id, existing.id))
                    .returning({
                        PasswordId: savedPasswords.id,
                        IsFavourite: savedPasswords.isFavourite,
                    })

                return Response.json(
                    updated[0] ?? {
                        PasswordId: existing.id,
                        IsFavourite: !existing.isFavourite,
                    },
                )
            },
        },
    },
})
