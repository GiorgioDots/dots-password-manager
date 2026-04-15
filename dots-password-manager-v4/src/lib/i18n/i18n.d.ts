import type authEn from '#/lib/i18n/locales/en/auth.json'
import type commonEn from '#/lib/i18n/locales/en/common.json'
import type errorEn from '#/lib/i18n/locales/en/error.json'
import type settingsEn from '#/lib/i18n/locales/en/settings.json'
import type themeEn from '#/lib/i18n/locales/en/theme.json'
import type validationEn from '#/lib/i18n/locales/en/validation.json'
import type vaultEn from '#/lib/i18n/locales/en/vault.json'

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'common'
        resources: {
            common: typeof commonEn
            auth: typeof authEn
            vault: typeof vaultEn
            settings: typeof settingsEn
            validation: typeof validationEn
            error: typeof errorEn
            theme: typeof themeEn
        }
    }
}
