import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
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

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
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
        fallbackLng: 'en',
        supportedLngs: supportedLanguages,
        defaultNS: 'common',
        ns: ['common', 'auth', 'vault', 'settings', 'validation', 'error', 'theme'],
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'dpm:language',
        },
    })

export default i18n
