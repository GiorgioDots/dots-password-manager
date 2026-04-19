import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import authEn from './locales/en/auth.json'
import commonEn from './locales/en/common.json'
import errorEn from './locales/en/error.json'
import settingsEn from './locales/en/settings.json'
import themeEn from './locales/en/theme.json'
import validationEn from './locales/en/validation.json'
import vaultEn from './locales/en/vault.json'
import authIt from './locales/it/auth.json'
import commonIt from './locales/it/common.json'
import errorIt from './locales/it/error.json'
import settingsIt from './locales/it/settings.json'
import themeIt from './locales/it/theme.json'
import validationIt from './locales/it/validation.json'
import vaultIt from './locales/it/vault.json'

export const supportedLanguages = ['en', 'it'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]
export const languageStorageKey = 'dpm:language'
export const languageCookieName = 'dpm_language'

export function normalizeLanguage(value?: string | null): SupportedLanguage {
    const language = value?.split('-')[0]?.toLowerCase()
    return language === 'it' ? 'it' : 'en'
}

export function getLanguageFromCookie(cookieHeader?: string | null): SupportedLanguage | null {
    if (!cookieHeader) {
        return null
    }

    for (const part of cookieHeader.split(';')) {
        const [rawKey, ...rest] = part.trim().split('=')
        if (rawKey !== languageCookieName) {
            continue
        }

        const value = decodeURIComponent(rest.join('='))
        return value === 'en' || value === 'it' ? value : null
    }

    return null
}

export function resolveRequestLanguage({
    cookieHeader,
    acceptLanguage,
}: {
    cookieHeader?: string | null
    acceptLanguage?: string | null
}): SupportedLanguage {
    return getLanguageFromCookie(cookieHeader) ?? normalizeLanguage(acceptLanguage)
}

export function getPreferredLanguage(): SupportedLanguage {
    if (typeof window === 'undefined') {
        return 'en'
    }

    const fromCookie = getLanguageFromCookie(document.cookie)
    if (fromCookie) {
        return fromCookie
    }

    const storedLanguage = window.localStorage.getItem(languageStorageKey)
    if (storedLanguage === 'en' || storedLanguage === 'it') {
        return storedLanguage
    }

    return normalizeLanguage(window.navigator.language)
}

export function persistLanguage(language: SupportedLanguage) {
    if (typeof window === 'undefined') {
        return
    }

    document.cookie = `${languageCookieName}=${encodeURIComponent(language)}; Path=/; Max-Age=31536000; SameSite=Lax`
    window.localStorage.setItem(languageStorageKey, language)
}

i18n.use(initReactI18next).init({
    resources: {
        en: {
            common: commonEn,
            auth: authEn,
            vault: vaultEn,
            settings: settingsEn,
            validation: validationEn,
            error: errorEn,
            theme: themeEn,
        },
        it: {
            common: commonIt,
            auth: authIt,
            vault: vaultIt,
            settings: settingsIt,
            validation: validationIt,
            error: errorIt,
            theme: themeIt,
        },
    },
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    defaultNS: 'common',
    ns: ['common', 'auth', 'vault', 'settings', 'validation', 'error', 'theme'],
    interpolation: {
        escapeValue: false,
    },
    initAsync: false,
})

export default i18n
