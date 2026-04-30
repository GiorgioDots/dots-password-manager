import { createServerFn } from '@tanstack/react-start'

import type { ImportExportDto, SavedPasswordDto } from '#/lib/shared/passwords/contracts'
import { getRequest } from '@tanstack/react-start/server'

type SessionUser = {
    id: string
    email: string
    username: string
    originalUsername: string
    salt: string
    passwordSalt: string
    passwordHash: string
}

async function importSessionUser(request: Request): Promise<SessionUser | null> {
    const { getSessionUser } = await import('#/lib/server/auth/session')
    return getSessionUser(request)
}

async function requireSessionUser(request: Request): Promise<Exclude<SessionUser, null>> {
    const user = await importSessionUser(request)
    if (!user) {
        throw new Error('Unauthorized')
    }

    return user
}

export const getPasswordsServerFn = createServerFn({ method: 'GET' }).handler(
    async (): Promise<SavedPasswordDto[]> => {
        const request = getRequest()
        const user = await requireSessionUser(request)
        const [{ eq }, { db }, { savedPasswords }, { toSavedPasswordListResponse }] =
            await Promise.all([
                import('drizzle-orm'),
                import('#/lib/server/db'),
                import('#/lib/server/db/schema'),
                import('#/lib/server/passwords/mapper'),
            ])

        const passwords = await db.query.savedPasswords.findMany({
            where: eq(savedPasswords.userId, user.id),
        })

        return passwords.map(toSavedPasswordListResponse)
    },
)

export const getPasswordByIdServerFn = createServerFn({ method: 'GET' })
    .inputValidator((input: { PasswordId: string }) => input)
    .handler(async ({ data }): Promise<SavedPasswordDto> => {
        const request = getRequest()
        const user = await requireSessionUser(request)
        const [{ and, eq }, { db }, { savedPasswords }, { toSavedPasswordResponse }] =
            await Promise.all([
                import('drizzle-orm'),
                import('#/lib/server/db'),
                import('#/lib/server/db/schema'),
                import('#/lib/server/passwords/mapper'),
            ])

        const password = await db.query.savedPasswords.findFirst({
            where: and(eq(savedPasswords.userId, user.id), eq(savedPasswords.id, data.PasswordId)),
        })

        if (!password) {
            throw new Error('Not Found')
        }

        return toSavedPasswordResponse(password, user, null)
    })

export const createPasswordServerFn = createServerFn({ method: 'POST' })
    .inputValidator((input: { Password: SavedPasswordDto }) => input)
    .handler(async ({ data }): Promise<SavedPasswordDto> => {
        const request = getRequest()
        const user = await requireSessionUser(request)
        const [{ db }, { savedPasswords }, { toSavedPasswordEntity, toSavedPasswordResponse }] =
            await Promise.all([
                import('#/lib/server/db'),
                import('#/lib/server/db/schema'),
                import('#/lib/server/passwords/mapper'),
            ])

        const body = data.Password

        if (!body.Name.trim() || !body.Login.trim() || !body.Password.trim()) {
            throw new Error('Invalid request.')
        }

        const created = await db
            .insert(savedPasswords)
            .values({
                ...toSavedPasswordEntity(body, user),
                userId: user.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning()

        return toSavedPasswordResponse(created[0], user, null)
    })

export const editPasswordServerFn = createServerFn({ method: 'POST' })
    .inputValidator((input: { Password: SavedPasswordDto }) => input)
    .handler(async ({ data }): Promise<SavedPasswordDto> => {
        const request = getRequest()
        const user = await requireSessionUser(request)
        const [
            { and, eq },
            { db },
            { savedPasswords },
            { toSavedPasswordEntity, toSavedPasswordResponse },
        ] = await Promise.all([
            import('drizzle-orm'),
            import('#/lib/server/db'),
            import('#/lib/server/db/schema'),
            import('#/lib/server/passwords/mapper'),
        ])

        const body = data.Password

        if (!body.PasswordId || !body.Name.trim() || !body.Login.trim() || !body.Password.trim()) {
            throw new Error('Invalid request.')
        }

        const existing = await db.query.savedPasswords.findFirst({
            where: and(eq(savedPasswords.id, body.PasswordId), eq(savedPasswords.userId, user.id)),
        })

        if (!existing) {
            throw new Error('Not Found')
        }

        const next = toSavedPasswordEntity(body, user)

        const updated = await db
            .update(savedPasswords)
            .set({
                ...next,
                updatedAt: new Date(),
            })
            .where(eq(savedPasswords.id, existing.id))
            .returning()

        return toSavedPasswordResponse(updated[0], user, null)
    })

export const deletePasswordServerFn = createServerFn({ method: 'POST' })
    .inputValidator((input: { PasswordId: string }) => input)
    .handler(async ({ data }): Promise<{ Message: string }> => {
        const request = getRequest()
        const user = await requireSessionUser(request)
        const [{ and, eq }, { db }, { savedPasswords }] = await Promise.all([
            import('drizzle-orm'),
            import('#/lib/server/db'),
            import('#/lib/server/db/schema'),
        ])

        const password = await db.query.savedPasswords.findFirst({
            where: and(eq(savedPasswords.userId, user.id), eq(savedPasswords.id, data.PasswordId)),
            columns: { id: true },
        })

        if (!password) {
            throw new Error('Not Found')
        }

        await db.delete(savedPasswords).where(eq(savedPasswords.id, password.id))

        return { Message: 'Password deleted' }
    })

export const togglePasswordFavouriteServerFn = createServerFn({
    method: 'POST',
})
    .inputValidator((input: { PasswordId: string }) => input)
    .handler(async ({ data }): Promise<{ PasswordId: string; IsFavourite: boolean }> => {
        const request = getRequest()
        const user = await requireSessionUser(request)
        const [{ and, eq }, { db }, { savedPasswords }] = await Promise.all([
            import('drizzle-orm'),
            import('#/lib/server/db'),
            import('#/lib/server/db/schema'),
        ])

        const existing = await db.query.savedPasswords.findFirst({
            where: and(eq(savedPasswords.userId, user.id), eq(savedPasswords.id, data.PasswordId)),
        })

        if (!existing) {
            throw new Error('Not Found')
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

        return (
            updated[0] ?? {
                PasswordId: existing.id,
                IsFavourite: !existing.isFavourite,
            }
        )
    })

export const exportPasswordsServerFn = createServerFn({ method: 'GET' }).handler(
    async (): Promise<ImportExportDto> => {
        const request = getRequest()
        const user = await requireSessionUser(request)
        const [{ eq }, { db }, { savedPasswords }, { toImportExportPassword }] = await Promise.all([
            import('drizzle-orm'),
            import('#/lib/server/db'),
            import('#/lib/server/db/schema'),
            import('#/lib/server/passwords/mapper'),
        ])

        const passwords = await db.query.savedPasswords.findMany({
            where: eq(savedPasswords.userId, user.id),
        })

        return {
            AUTHENTIFIANT: passwords.map((p) => toImportExportPassword(p, user)),
        }
    },
)

export const importPasswordsServerFn = createServerFn({ method: 'POST' })
    .inputValidator((input: { Payload: ImportExportDto }) => input)
    .handler(async ({ data }): Promise<{ Message: string }> => {
        const request = getRequest()
        const user = await requireSessionUser(request)
        const [{ db }, { savedPasswords }, { toSavedPasswordEntity }] = await Promise.all([
            import('#/lib/server/db'),
            import('#/lib/server/db/schema'),
            import('#/lib/server/passwords/mapper'),
        ])

        const body = data.Payload

        if (body.AUTHENTIFIANT.length === 0) {
            throw new Error('The file you imported is not compatible')
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

        return {
            Message: 'Password imported successfully',
        }
    })
