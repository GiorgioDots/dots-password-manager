import { createFileRoute, redirect } from '@tanstack/react-router'
import { isLoggedIn } from '#/lib/client-auth'

export const Route = createFileRoute('/')({
    beforeLoad: () => {
        // On SSR we cannot read localStorage tokens, so defer auth decision to client.
        if (typeof window === 'undefined') {
            throw redirect({ to: '/saved-passwords' })
        }

        if (isLoggedIn()) {
            throw redirect({ to: '/saved-passwords' })
        }

        throw redirect({ to: '/auth/login' })
    },
    component: () => null,
})
