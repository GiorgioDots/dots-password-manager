import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import type { SupportedLanguage } from '#/lib/i18n/config'
import { resolveRequestLanguage } from '#/lib/i18n/config'

export const getPreferredLanguageServerFn = createServerFn({ method: 'GET' }).handler(
    async (): Promise<SupportedLanguage> => {
        const request = getRequest()

        return resolveRequestLanguage({
            cookieHeader: request.headers.get('cookie'),
            acceptLanguage: request.headers.get('accept-language'),
        })
    },
)
