import { describe, expect, it } from 'vitest'

import type { SavedPasswordDto } from '#/lib/shared/passwords/contracts'

import { dedupePasswordsById, getCommandItemValue, splitPasswordsByFavourite } from './editor'

function makePassword(overrides: Partial<SavedPasswordDto> = {}): SavedPasswordDto {
    return {
        PasswordId: 'pw-1',
        Name: 'GitHub',
        Login: 'giorgio',
        SecondLogin: null,
        Password: 'secret',
        Url: 'https://github.com',
        Notes: null,
        Tags: ['dev'],
        IsFavourite: false,
        ...overrides,
    }
}

describe('password editor helpers', () => {
    it('removes repeated ids from the command list dataset', () => {
        const duplicate = makePassword({ PasswordId: 'pw-1' })
        const unique = makePassword({ PasswordId: 'pw-2', Name: 'Email' })

        expect(dedupePasswordsById([duplicate, duplicate, unique])).toEqual([duplicate, unique])
    })

    it('keeps command item values unique for otherwise identical rows', () => {
        const first = makePassword({ PasswordId: 'pw-1' })
        const second = makePassword({ PasswordId: 'pw-2' })

        expect(getCommandItemValue(first)).not.toBe(getCommandItemValue(second))
    })

    it('keeps favourites separated from the rest', () => {
        const github = makePassword({ PasswordId: 'pw-1', Name: 'GitHub', IsFavourite: false })
        const bank = makePassword({ PasswordId: 'pw-2', Name: 'Bank', IsFavourite: true })

        const result = splitPasswordsByFavourite([github, bank])

        expect(result.hasFavourites).toBe(true)
        expect(result.favouritePasswords).toEqual([bank])
        expect(result.otherPasswords).toEqual([github])
    })
})
