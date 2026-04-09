import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AUTH_STATE_CHANGED_EVENT, clearTokens, isLoggedIn } from '#/lib/client/auth'

type ClientAuthContextValue = {
    loggedIn: boolean | undefined
    logout: () => void
    refresh: () => void
}

const ClientAuthContext = createContext<ClientAuthContextValue | undefined>(undefined)

export function ClientAuthProvider({ children }: { children: ReactNode }) {
    const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        function syncLoginState() {
            setLoggedIn(isLoggedIn())
        }

        syncLoginState()

        function onStorage(event: StorageEvent) {
            if (!event.key) {
                syncLoginState()
                return
            }

            if (event.key === 'accessToken' || event.key === 'refreshToken') {
                syncLoginState()
            }
        }

        window.addEventListener(AUTH_STATE_CHANGED_EVENT, syncLoginState)
        window.addEventListener('storage', onStorage)

        return () => {
            window.removeEventListener(AUTH_STATE_CHANGED_EVENT, syncLoginState)
            window.removeEventListener('storage', onStorage)
        }
    }, [])

    const value = useMemo<ClientAuthContextValue>(
        () => ({
            loggedIn,
            logout: () => {
                clearTokens()
                setLoggedIn(false)
            },
            refresh: () => {
                setLoggedIn(isLoggedIn())
            },
        }),
        [loggedIn],
    )

    return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>
}

export function useClientAuth() {
    const context = useContext(ClientAuthContext)
    if (!context) {
        throw new Error('useClientAuth must be used inside ClientAuthProvider')
    }

    return context
}
