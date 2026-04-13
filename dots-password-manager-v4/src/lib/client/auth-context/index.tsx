import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { ClientAuthContext } from './context'
import type { ClientAuthContextValue } from './context'

import {
    AUTH_FORCE_LOGOUT_EVENT,
    AUTH_STATE_CHANGED_EVENT,
    isLoggedIn,
    logout,
} from '#/lib/client/auth'

export function ClientAuthProvider({
    children,
    initialLoggedIn,
}: {
    children: ReactNode
    initialLoggedIn?: boolean
}) {
    const [loggedIn, setLoggedIn] = useState<boolean | undefined>(initialLoggedIn)
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    useEffect(() => {
        async function syncLoginState() {
            setLoggedIn(await isLoggedIn())
        }

        async function applyForcedLogout() {
            await queryClient.cancelQueries()
            queryClient.clear()
            setLoggedIn(false)
            await navigate({ to: '/auth/login', replace: true })
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

        function onForceLogout() {
            applyForcedLogout().catch(() => {})
        }

        window.addEventListener(AUTH_STATE_CHANGED_EVENT, onAuthStateChanged)
        window.addEventListener(AUTH_FORCE_LOGOUT_EVENT, onForceLogout)
        document.addEventListener('visibilitychange', onVisibilityChange)

        return () => {
            window.removeEventListener(AUTH_STATE_CHANGED_EVENT, onAuthStateChanged)
            window.removeEventListener(AUTH_FORCE_LOGOUT_EVENT, onForceLogout)
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [navigate, queryClient])

    const value = useMemo<ClientAuthContextValue>(
        () => ({
            loggedIn,
            logout: async () => {
                await logout()
                await queryClient.cancelQueries()
                queryClient.clear()
                setLoggedIn(false)
                await navigate({ to: '/auth/login' })
            },
            refresh: async () => {
                setLoggedIn(await isLoggedIn())
            },
        }),
        [loggedIn, navigate, queryClient],
    )

    return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>
}

export * from './useClientAuth'
export * from './context'
