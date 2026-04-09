import { refreshTokenServerFn } from '#/lib/shared/server-functions/auth'

export const AUTH_STATE_CHANGED_EVENT = 'dpm:auth-state-changed'

function emitAuthStateChanged(): void {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT))
}

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('accessToken')
}

export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('refreshToken')
}

export function setTokens(token: string, refreshToken: string): void {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('accessToken', token)
    window.localStorage.setItem('refreshToken', refreshToken)
    emitAuthStateChanged()
}

export function clearTokens(): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem('accessToken')
    window.localStorage.removeItem('refreshToken')
    emitAuthStateChanged()
}

export function isLoggedIn(): boolean {
    return !!getAccessToken()
}

let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
        return null
    }

    try {
        const data = await refreshTokenServerFn({
            data: { Token: refreshToken },
        })

        if (!data.Token || !data.RefreshToken) {
            return null
        }

        setTokens(data.Token, data.RefreshToken)
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

export function forceLogout(): void {
    clearTokens()
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
    const accessToken = getAccessToken()
    const firstResponse = await performRequest(input, init, accessToken)

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
