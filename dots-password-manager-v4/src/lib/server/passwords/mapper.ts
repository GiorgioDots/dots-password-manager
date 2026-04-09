import type { savedPasswords, users } from '#/db/schema'
import { encryptForClient } from '#/lib/server/crypto/public-key'
import type {
    ImportExportPasswordDto,
    SavedPasswordDto,
} from '#/lib/shared/passwords/contracts'
import {
    decryptWithUserSalt,
    encryptWithUserSalt,
} from '#/lib/server/auth/vault-crypto'

type UserRow = Pick<
    typeof users.$inferSelect,
    | 'id'
    | 'email'
    | 'username'
    | 'originalUsername'
    | 'salt'
    | 'passwordSalt'
    | 'passwordHash'
>

type SavedPasswordRow = typeof savedPasswords.$inferSelect

export function toSavedPasswordEntity(
    dto: SavedPasswordDto,
    user: UserRow,
): Pick<
    SavedPasswordRow,
    | 'name'
    | 'login'
    | 'secondLogin'
    | 'passwordHash'
    | 'isFavourite'
    | 'url'
    | 'notes'
    | 'tags'
> {
    return {
        name: dto.Name,
        login: dto.Login,
        secondLogin: dto.SecondLogin ?? null,
        passwordHash: encryptWithUserSalt(dto.Password, user.salt),
        isFavourite: dto.IsFavourite ?? false,
        url: dto.Url ?? null,
        notes: dto.Notes ?? null,
        tags: dto.Tags ?? [],
    }
}

export function toSavedPasswordResponse(
    entity: SavedPasswordRow,
    user: UserRow,
    publicKey: string | null,
): SavedPasswordDto {
    const decryptedPassword = decryptWithUserSalt(
        entity.passwordHash,
        user.salt,
    )

    return {
        PasswordId: entity.id,
        Name: entity.name,
        Login: encryptForClient(entity.login, publicKey),
        SecondLogin: entity.secondLogin
            ? encryptForClient(entity.secondLogin, publicKey)
            : null,
        Password: encryptForClient(decryptedPassword, publicKey),
        Url: entity.url,
        Notes: entity.notes,
        Tags: entity.tags ?? [],
        IsFavourite: entity.isFavourite,
        CreatedAt: entity.createdAt
            ? entity.createdAt.toISOString()
            : undefined,
        UpdatedAt: entity.updatedAt
            ? entity.updatedAt.toISOString()
            : undefined,
    }
}

export function toSavedPasswordListResponse(
    entity: SavedPasswordRow,
): SavedPasswordDto {
    return {
        PasswordId: entity.id,
        Name: entity.name,
        Url: entity.url,
        Notes: entity.notes,
        Tags: entity.tags ?? [],
        IsFavourite: entity.isFavourite,
        CreatedAt: entity.createdAt
            ? entity.createdAt.toISOString()
            : undefined,
        UpdatedAt: entity.updatedAt
            ? entity.updatedAt.toISOString()
            : undefined,
        Login: '',
        Password: '',
        SecondLogin: null,
    }
}

export function toImportExportPassword(
    entity: SavedPasswordRow,
    user: UserRow,
): ImportExportPasswordDto {
    return {
        domain: entity.url ?? '',
        login: entity.login,
        secondLogin: entity.secondLogin,
        note: entity.notes ?? '',
        title: entity.name,
        password: decryptWithUserSalt(entity.passwordHash, user.salt),
        tags: entity.tags ?? [],
    }
}
