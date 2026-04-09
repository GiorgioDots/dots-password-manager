import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/db'
import { savedPasswords } from '#/db/schema'
import { getSessionUser, unauthorizedResponse } from '#/lib/auth/session'
import { getPublicKeyHeader } from '#/lib/crypto/client-public-key'
import type { SavedPasswordDto } from '#/lib/passwords/contracts'
import {
    toSavedPasswordEntity,
    toSavedPasswordResponse,
} from '#/lib/passwords/mapper'

function badRequest(message: string, status = 400): Response {
    return Response.json({ Message: message }, { status })
}

export const Route = createFileRoute('/api/passwords/create')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const user = await getSessionUser(request)
                if (!user) {
                    return unauthorizedResponse()
                }

                const body = (await request.json()) as Partial<SavedPasswordDto>

                if (
                    !body.Name?.trim() ||
                    !body.Login?.trim() ||
                    !body.Password?.trim()
                ) {
                    return badRequest('Invalid request.')
                }

                const created = await db
                    .insert(savedPasswords)
                    .values({
                        ...toSavedPasswordEntity(
                            body as SavedPasswordDto,
                            user,
                        ),
                        userId: user.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .returning()

                const password = created[0]

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
