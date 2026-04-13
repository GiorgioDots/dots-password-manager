import { useContext } from 'react'
import { ClientAuthContext } from './context'

export function useClientAuth() {
    const context = useContext(ClientAuthContext)
    if (!context) {
        throw new Error('useClientAuth must be used inside ClientAuthProvider')
    }

    return context
}
