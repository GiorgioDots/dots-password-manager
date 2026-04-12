import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AUTH_STATE_CHANGED_EVENT, isLoggedIn, logout } from '#/lib/client/auth'

type ClientAuthContextValue = {
    loggedIn: boolean | undefined
    logout: () => Promise<void>
    refresh: () => Promise<void>
}

const ClientAuthContext = createContext<ClientAuthContextValue | undefined>(undefined)

export function ClientAuthProvider({ children }: { children: ReactNode }) {
    const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        async function syncLoginState() {
            setLoggedIn(await isLoggedIn())
        }

        syncLoginState().catch(() => {})

        function onVisibilityChange() {
            if (!document.hidden) {
                syncLoginState().catch(() => {})
            }
        }

        function onAuthStateChanged() {
            syncLoginState().catch(() => {})
        }

        window.addEventListener(AUTH_STATE_CHANGED_EVENT, onAuthStateChanged)
        document.addEventListener('visibilitychange', onVisibilityChange)

        return () => {
            window.removeEventListener(AUTH_STATE_CHANGED_EVENT, onAuthStateChanged)
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [])

    const value = useMemo<ClientAuthContextValue>(
        () => ({
            loggedIn,
            logout: async () => {
                await logout()
                setLoggedIn(false)
            },
            refresh: async () => {
                setLoggedIn(await isLoggedIn())
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
