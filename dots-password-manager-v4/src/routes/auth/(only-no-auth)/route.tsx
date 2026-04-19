import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AuthLoadingScreen } from '#/components/auth/AuthLoadingScreen'
import { isLoggedIn } from '#/lib/client/auth'
import { useClientAuth } from '#/lib/client/auth-context/index'

export const Route = createFileRoute('/auth/(only-no-auth)')({
    component: RouteComponent,
    pendingComponent: AuthLoadingScreen,
    pendingMs: 0,
    beforeLoad: async () => {
        if (await isLoggedIn({ force: true })) {
            throw redirect({ to: '/saved-passwords' })
        }
    },
})

function RouteComponent() {
    const { loggedIn } = useClientAuth()

    if (loggedIn !== false) {
        return <AuthLoadingScreen />
    }

    return <Outlet />
}
