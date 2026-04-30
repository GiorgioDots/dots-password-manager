import { forceLogout } from '#/lib/client/auth'
import type { ImportExportDto, SavedPasswordDto } from '#/lib/shared/passwords/contracts'
import {
    createPasswordServerFn,
    deletePasswordServerFn,
    editPasswordServerFn,
    exportPasswordsServerFn,
    getPasswordByIdServerFn,
    getPasswordsServerFn,
    importPasswordsServerFn,
    togglePasswordFavouriteServerFn,
} from '#/lib/shared/server-functions/passwords'

function errorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message
    }

    return fallback
}

function isUnauthorized(error: unknown): boolean {
    return errorMessage(error, '').toLowerCase().includes('unauthorized')
}

async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn()
    } catch (error) {
        if (!isUnauthorized(error)) {
            throw error
        }

        forceLogout()
        throw new Error('Unauthorized')
    }
}

export async function getPasswords(): Promise<SavedPasswordDto[]> {
    try {
        return await withAuth(() => getPasswordsServerFn())
    } catch {
        throw new Error('Failed to load passwords')
    }
}

export async function getPasswordById(id: string): Promise<SavedPasswordDto> {
    try {
        return await withAuth(() =>
            getPasswordByIdServerFn({
                data: { PasswordId: id },
            }),
        )
    } catch {
        throw new Error('Failed to load password')
    }
}

export async function createPassword(input: SavedPasswordDto): Promise<SavedPasswordDto> {
    try {
        return await withAuth(() =>
            createPasswordServerFn({
                data: { Password: input },
            }),
        )
    } catch {
        throw new Error('Failed to create password')
    }
}

export async function editPassword(input: SavedPasswordDto): Promise<SavedPasswordDto> {
    try {
        return await withAuth(() =>
            editPasswordServerFn({
                data: { Password: input },
            }),
        )
    } catch {
        throw new Error('Failed to update password')
    }
}

export async function deletePassword(id: string): Promise<void> {
    try {
        await withAuth(() =>
            deletePasswordServerFn({
                data: { PasswordId: id },
            }),
        )
    } catch {
        throw new Error('Failed to delete password')
    }
}

export async function togglePasswordFavourite(
    id: string,
): Promise<{ PasswordId: string; IsFavourite: boolean }> {
    try {
        return await withAuth(() =>
            togglePasswordFavouriteServerFn({
                data: { PasswordId: id },
            }),
        )
    } catch {
        throw new Error('Failed to toggle favourite')
    }
}

export async function exportPasswords(): Promise<ImportExportDto> {
    try {
        return await withAuth(() => exportPasswordsServerFn())
    } catch {
        throw new Error('Failed to export passwords')
    }
}

export async function importPasswords(payload: ImportExportDto): Promise<void> {
    try {
        await withAuth(() =>
            importPasswordsServerFn({
                data: { Payload: payload },
            }),
        )
    } catch {
        throw new Error('Failed to import passwords')
    }
}
