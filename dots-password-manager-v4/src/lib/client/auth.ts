import {
    getAuthSessionServerFn,
    logoutServerFn,
    refreshTokenServerFn,
} from '#/lib/shared/server-functions/auth'

export const AUTH_STATE_CHANGED_EVENT = 'dpm:auth-state-changed'

export function notifyAuthStateChanged(): void {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT))
}

export async function isLoggedIn(): Promise<boolean> {
    try {
        const session = await getAuthSessionServerFn()
        return session.LoggedIn
    } catch {
        return false
    }
}

let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
    try {
        const data = await refreshTokenServerFn({ data: {} })

        if (!data.Token || !data.RefreshToken) {
            return null
        }

        notifyAuthStateChanged()
        return data.Token
    } catch {
        return null
    }
}

async function refreshAccessTokenOnce(): Promise<string | null> {
    if (!refreshInFlight) {
        refreshInFlight = refreshAccessToken().finally(() => {
            refreshInFlight = null
        })
    }

    return refreshInFlight
}

export async function logout(): Promise<void> {
    try {
        await logoutServerFn({ data: undefined })
    } catch {
        // Keep client flow resilient even if server logout fails.
    }

    notifyAuthStateChanged()
}

export function forceLogout(): void {
    logout().catch(() => {})
    if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
    }
}

export async function tryRefreshAccessToken(): Promise<string | null> {
    return refreshAccessTokenOnce()
}

function withAuthHeaders(init?: RequestInit, token?: string | null): Headers {
    const headers = new Headers(init?.headers)

    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    if (!headers.has('Content-Type') && init?.body) {
        headers.set('Content-Type', 'application/json')
    }

    return headers
}

async function performRequest(
    input: RequestInfo | URL,
    init: RequestInit | undefined,
    token: string | null,
): Promise<Response> {
    return fetch(input, {
        ...init,
        headers: withAuthHeaders(init, token),
    })
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const firstResponse = await performRequest(input, init, null)

    if (firstResponse.status !== 401) {
        return firstResponse
    }

    const path =
        typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url

    if (path.includes('/api/auth/refresh-token')) {
        return firstResponse
    }

    const refreshedToken = await refreshAccessTokenOnce()
    if (!refreshedToken) {
        forceLogout()
        return firstResponse
    }

    const retryResponse = await performRequest(input, init, refreshedToken)
    if (retryResponse.status === 401) {
        forceLogout()
    }

    return retryResponse
}
