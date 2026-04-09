import { createServerFn } from '@tanstack/react-start'

import type { ImportExportDto, SavedPasswordDto } from '#/lib/shared/passwords/contracts'

const CLAIM_NAME_ID = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

type SessionUser = {
    id: string
    email: string
    username: string
    originalUsername: string
    salt: string
    passwordSalt: string
    passwordHash: string
}

type AuthInput = {
    AccessToken: string
}

async function getSessionUserFromAccessToken(accessToken: string): Promise<SessionUser | null> {
    const [{ eq }, { db }, { users }, { verifyJwt }] = await Promise.all([
        import('drizzle-orm'),
        import('#/lib/server/db'),
        import('#/lib/server/db/schema'),
        import('#/lib/server/auth/jwt'),
    ])

    try {
        const payload = verifyJwt(accessToken)
        const userId = payload[CLAIM_NAME_ID]

        if (typeof userId !== 'string') {
            return null
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                id: true,
                email: true,
                username: true,
                originalUsername: true,
                salt: true,
                passwordSalt: true,
                passwordHash: true,
            },
        })

        return user ?? null
    } catch {
        return null
    }
}

async function requireSessionUser(accessToken: string): Promise<SessionUser> {
    const user = await getSessionUserFromAccessToken(accessToken)
    if (!user) {
        throw new Error('Unauthorized')
    }

    return user
}

export const getPasswordsServerFn = createServerFn({ method: 'GET' })
    .inputValidator((input: AuthInput) => input)
    .handler(async ({ data }): Promise<SavedPasswordDto[]> => {
        const user = await requireSessionUser(data.AccessToken)
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
    })

export const getPasswordByIdServerFn = createServerFn({ method: 'GET' })
    .inputValidator((input: AuthInput & { PasswordId: string }) => input)
    .handler(async ({ data }): Promise<SavedPasswordDto> => {
        const user = await requireSessionUser(data.AccessToken)
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
    .inputValidator((input: AuthInput & { Password: SavedPasswordDto }) => input)
    .handler(async ({ data }): Promise<SavedPasswordDto> => {
        const user = await requireSessionUser(data.AccessToken)
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
    .inputValidator((input: AuthInput & { Password: SavedPasswordDto }) => input)
    .handler(async ({ data }): Promise<SavedPasswordDto> => {
        const user = await requireSessionUser(data.AccessToken)
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
    .inputValidator((input: AuthInput & { PasswordId: string }) => input)
    .handler(async ({ data }): Promise<{ Message: string }> => {
        const user = await requireSessionUser(data.AccessToken)
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
    .inputValidator((input: AuthInput & { PasswordId: string }) => input)
    .handler(async ({ data }): Promise<{ PasswordId: string; IsFavourite: boolean }> => {
        const user = await requireSessionUser(data.AccessToken)
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

export const exportPasswordsServerFn = createServerFn({ method: 'GET' })
    .inputValidator((input: AuthInput) => input)
    .handler(async ({ data }): Promise<ImportExportDto> => {
        const user = await requireSessionUser(data.AccessToken)
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
    })

export const importPasswordsServerFn = createServerFn({ method: 'POST' })
    .inputValidator((input: AuthInput & { Payload: ImportExportDto }) => input)
    .handler(async ({ data }): Promise<{ Message: string }> => {
        const user = await requireSessionUser(data.AccessToken)
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
