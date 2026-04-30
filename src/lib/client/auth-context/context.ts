import { createContext } from 'react'

export type ClientAuthContextValue = {
    loggedIn: boolean | undefined
    logout: () => Promise<void>
    refresh: () => Promise<void>
}

export const ClientAuthContext = createContext<ClientAuthContextValue | undefined>(undefined)
