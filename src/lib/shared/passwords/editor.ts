import type { SavedPasswordDto } from './contracts'

export function normalizeSavedPassword(item: SavedPasswordDto): SavedPasswordDto {
    return {
        PasswordId: item.PasswordId,
        Name: item.Name,
        Login: item.Login,
        SecondLogin: item.SecondLogin ?? null,
        Password: item.Password,
        Url: item.Url ?? null,
        Notes: item.Notes ?? null,
        Tags: item.Tags ?? [],
        IsFavourite: item.IsFavourite ?? false,
        CreatedAt: item.CreatedAt,
        UpdatedAt: item.UpdatedAt,
    }
}

export function createEmptyPasswordDraft(): SavedPasswordDto {
    return {
        Name: '',
        Login: '',
        SecondLogin: null,
        Password: '',
        Url: null,
        Notes: null,
        Tags: [],
        IsFavourite: false,
    }
}

export function serializePasswordDraft(item: SavedPasswordDto | null): string {
    if (!item) {
        return ''
    }

    return JSON.stringify({
        PasswordId: item.PasswordId ?? null,
        Name: item.Name.trim(),
        Login: item.Login.trim(),
        SecondLogin: item.SecondLogin?.trim() || '',
        Password: item.Password,
        Url: item.Url?.trim() || '',
        Notes: item.Notes?.trim() || '',
        Tags: (item.Tags ?? []).map((tag) => tag.trim()).filter(Boolean),
        IsFavourite: item.IsFavourite ?? false,
    })
}

export function dedupePasswordsById(items: SavedPasswordDto[]): SavedPasswordDto[] {
    const seen = new Set<string>()

    return items.filter((item, index) => {
        const key =
            item.PasswordId?.trim() || `${item.Name}|${item.Login}|${item.Url ?? ''}|${index}`
        if (seen.has(key)) {
            return false
        }

        seen.add(key)
        return true
    })
}

export function sortPasswordsByFavouriteAndName(items: SavedPasswordDto[]): SavedPasswordDto[] {
    return [...dedupePasswordsById(items)].sort((a, b) => {
        const favA = a.IsFavourite ? 1 : 0
        const favB = b.IsFavourite ? 1 : 0

        if (favA !== favB) {
            return favB - favA
        }

        return a.Name.localeCompare(b.Name)
    })
}

export function splitPasswordsByFavourite(items: SavedPasswordDto[]) {
    const orderedPasswords = sortPasswordsByFavouriteAndName(items)
    const favouritePasswords = orderedPasswords.filter((item) => item.IsFavourite)
    const otherPasswords = orderedPasswords.filter((item) => !item.IsFavourite)

    return {
        orderedPasswords,
        favouritePasswords,
        otherPasswords,
        hasFavourites: favouritePasswords.length > 0,
    }
}

export function getCommandItemValue(item: SavedPasswordDto): string {
    return [
        item.PasswordId ?? '',
        item.Name,
        item.Login,
        item.SecondLogin ?? '',
        item.Url ?? '',
        ...(item.Tags ?? []),
    ]
        .join(' ')
        .trim()
}
