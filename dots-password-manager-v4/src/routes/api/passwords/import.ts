import { createFileRoute } from '@tanstack/react-router'

import { db } from '#/db'
import { savedPasswords } from '#/db/schema'
import { getSessionUser, unauthorizedResponse } from '#/lib/auth/session'
import type {
    ImportExportDto,
    SavedPasswordDto,
} from '#/lib/passwords/contracts'
import { toSavedPasswordEntity } from '#/lib/passwords/mapper'

function badRequest(message: string, status = 400): Response {
    return Response.json({ Message: message }, { status })
}

export const Route = createFileRoute('/api/passwords/import')({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const user = await getSessionUser(request)
                if (!user) {
                    return unauthorizedResponse()
                }

                const body = (await request.json()) as Partial<ImportExportDto>
                if (!body.AUTHENTIFIANT || body.AUTHENTIFIANT.length === 0) {
                    return badRequest('The file you imported is not compatible')
                }

                const values = body.AUTHENTIFIANT.map((item) => {
                    const dto: SavedPasswordDto = {
                        Name: item.title,
                        Login: item.login,
                        SecondLogin: item.secondLogin,
                        Password: item.password,
                        Url: item.domain,
                        Notes: item.note,
                        Tags: item.tags ?? [],
                        IsFavourite: false,
                    }

                    return {
                        ...toSavedPasswordEntity(dto, user),
                        userId: user.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                })

                await db.insert(savedPasswords).values(values)

                return Response.json({
                    Message: 'Password imported successfully',
                })
            },
        },
    },
})
