import { describe, expect, it } from 'vitest'

import { resolveRequestLanguage } from './config'

describe('resolveRequestLanguage', () => {
    it('prefers the language cookie when present', () => {
        expect(
            resolveRequestLanguage({
                cookieHeader: 'foo=1; dpm_language=it; other=2',
                acceptLanguage: 'en-US,en;q=0.9',
            }),
        ).toBe('it')
    })

    it('falls back to the request accept-language header', () => {
        expect(
            resolveRequestLanguage({
                cookieHeader: null,
                acceptLanguage: 'it-IT,it;q=0.9,en;q=0.8',
            }),
        ).toBe('it')
    })

    it('defaults to english for unknown values', () => {
        expect(
            resolveRequestLanguage({
                cookieHeader: 'dpm_language=fr',
                acceptLanguage: 'fr-FR,fr;q=0.9',
            }),
        ).toBe('en')
    })
})
