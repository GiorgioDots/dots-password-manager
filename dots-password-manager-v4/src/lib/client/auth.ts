import { getAuthSessionServerFn, logoutServerFn } from '#/lib/shared/server-functions/auth'

export const AUTH_STATE_CHANGED_EVENT = 'dpm:auth-state-changed'
export const AUTH_FORCE_LOGOUT_EVENT = 'dpm:auth-force-logout'
const AUTH_STATE_CACHE_TTL_MS = 15_000

let authStateCache: { loggedIn: boolean; expiresAt: number } | null = null
let authStateInFlight: Promise<boolean> | null = null

function setAuthStateCache(loggedIn: boolean): void {
    authStateCache = {
        loggedIn,
        expiresAt: Date.now() + AUTH_STATE_CACHE_TTL_MS,
    }
}

function clearAuthStateCache(): void {
    authStateCache = null
}

export function notifyAuthStateChanged(): void {
    clearAuthStateCache()
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT))
}

export async function isLoggedIn(options?: { force?: boolean }): Promise<boolean> {
    const force = options?.force === true

    if (!force && authStateCache && authStateCache.expiresAt > Date.now()) {
        return authStateCache.loggedIn
    }

    if (!force && authStateInFlight) {
        return authStateInFlight
    }

    authStateInFlight = getAuthSessionServerFn()
        .then((session) => {
            setAuthStateCache(session.LoggedIn)
            return session.LoggedIn
        })
        .catch(() => {
            setAuthStateCache(false)
            return false
        })
        .finally(() => {
            authStateInFlight = null
        })

    return authStateInFlight
}

export async function logout(): Promise<void> {
    try {
        await logoutServerFn({ data: undefined })
    } catch {
        // Keep client flow resilient even if server logout fails.
    }

    setAuthStateCache(false)
    notifyAuthStateChanged()
}

export function forceLogout(): void {
    logout().catch(() => {})
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(AUTH_FORCE_LOGOUT_EVENT))
    }
}
