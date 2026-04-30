import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import type { AuthSessionResponse } from '#/lib/shared/auth/contracts'

/**
 * Checks if there is an active session for the current request.
 * Used by the root loader and route guards (beforeLoad).
 */
export const getAuthSessionServerFn = createServerFn({ method: 'GET' }).handler(
    async (): Promise<AuthSessionResponse> => {
        const request = getRequest()
        const { auth } = await import('#/lib/server/auth/better-auth')
        const session = await auth.api.getSession({ headers: request.headers })
        return {
            LoggedIn: Boolean(session?.user),
        }
    },
)

export function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message
    }
    return fallback
}
