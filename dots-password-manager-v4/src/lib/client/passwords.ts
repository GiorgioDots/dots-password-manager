import { forceLogout, getAccessToken, tryRefreshAccessToken } from '#/lib/client/auth'
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

async function withAuth<T>(fn: (accessToken: string) => Promise<T>): Promise<T> {
    const firstToken = getAccessToken()
    if (!firstToken) {
        forceLogout()
        throw new Error('Unauthorized')
    }

    try {
        return await fn(firstToken)
    } catch (error) {
        if (!isUnauthorized(error)) {
            throw error
        }

        const refreshedToken = await tryRefreshAccessToken()
        if (!refreshedToken) {
            forceLogout()
            throw new Error('Unauthorized')
        }

        try {
            return await fn(refreshedToken)
        } catch (retryError) {
            if (isUnauthorized(retryError)) {
                forceLogout()
            }
            throw retryError
        }
    }
}

export async function getPasswords(): Promise<SavedPasswordDto[]> {
    try {
        return await withAuth((accessToken) =>
            getPasswordsServerFn({ data: { AccessToken: accessToken } }),
        )
    } catch {
        throw new Error('Failed to load passwords')
    }
}

export async function getPasswordById(id: string): Promise<SavedPasswordDto> {
    try {
        return await withAuth((accessToken) =>
            getPasswordByIdServerFn({
                data: { AccessToken: accessToken, PasswordId: id },
            }),
        )
    } catch {
        throw new Error('Failed to load password')
    }
}

export async function createPassword(input: SavedPasswordDto): Promise<SavedPasswordDto> {
    try {
        return await withAuth((accessToken) =>
            createPasswordServerFn({
                data: { AccessToken: accessToken, Password: input },
            }),
        )
    } catch {
        throw new Error('Failed to create password')
    }
}

export async function editPassword(input: SavedPasswordDto): Promise<SavedPasswordDto> {
    try {
        return await withAuth((accessToken) =>
            editPasswordServerFn({
                data: { AccessToken: accessToken, Password: input },
            }),
        )
    } catch {
        throw new Error('Failed to update password')
    }
}

export async function deletePassword(id: string): Promise<void> {
    try {
        await withAuth((accessToken) =>
            deletePasswordServerFn({
                data: { AccessToken: accessToken, PasswordId: id },
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
        return await withAuth((accessToken) =>
            togglePasswordFavouriteServerFn({
                data: { AccessToken: accessToken, PasswordId: id },
            }),
        )
    } catch {
        throw new Error('Failed to toggle favourite')
    }
}

export async function exportPasswords(): Promise<ImportExportDto> {
    try {
        return await withAuth((accessToken) =>
            exportPasswordsServerFn({ data: { AccessToken: accessToken } }),
        )
    } catch {
        throw new Error('Failed to export passwords')
    }
}

export async function importPasswords(payload: ImportExportDto): Promise<void> {
    try {
        await withAuth((accessToken) =>
            importPasswordsServerFn({
                data: { AccessToken: accessToken, Payload: payload },
            }),
        )
    } catch {
        throw new Error('Failed to import passwords')
    }
}
