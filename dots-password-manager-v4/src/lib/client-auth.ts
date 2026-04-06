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
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem('accessToken')
  window.localStorage.removeItem('refreshToken')
}

export function isLoggedIn(): boolean {
  return !!getAccessToken()
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const token = getAccessToken()
  const headers = new Headers(init?.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, {
    ...init,
    headers,
  })
}
