import { and, eq } from 'drizzle-orm'
import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/db'
import { savedPasswords } from '#/db/schema'
import { getSessionUser, unauthorizedResponse } from '#/lib/server/auth/session'
import { getPublicKeyHeader } from '#/lib/server/crypto/public-key'
import type { SavedPasswordDto } from '#/lib/shared/passwords/contracts'
import {
    toSavedPasswordEntity,
    toSavedPasswordResponse,
} from '#/lib/server/passwords/mapper'

function badRequest(message: string, status = 400): Response {
    return Response.json({ Message: message }, { status })
}

export const Route = createFileRoute('/api/passwords/edit')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const user = await getSessionUser(request)
                if (!user) {
                    return unauthorizedResponse()
                }

                const body = (await request.json()) as Partial<SavedPasswordDto>

                if (
                    !body.PasswordId ||
                    !body.Name?.trim() ||
                    !body.Login?.trim() ||
                    !body.Password?.trim()
                ) {
                    return badRequest('Invalid request.')
                }

                const existing = await db.query.savedPasswords.findFirst({
                    where: and(
                        eq(savedPasswords.id, body.PasswordId),
                        eq(savedPasswords.userId, user.id),
                    ),
                })

                if (!existing) {
                    return badRequest('Not Found')
                }

                const next = toSavedPasswordEntity(
                    body as SavedPasswordDto,
                    user,
                )

                const updated = await db
                    .update(savedPasswords)
                    .set({
                        ...next,
                        updatedAt: new Date(),
                    })
                    .where(eq(savedPasswords.id, existing.id))
                    .returning()

                const password = updated[0]

                return Response.json(
                    toSavedPasswordResponse(
                        password,
                        user,
                        getPublicKeyHeader(request),
                    ),
                )
            },
        },
    },
})
