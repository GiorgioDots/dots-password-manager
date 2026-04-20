import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AuthLoadingScreen } from '#/components/auth/AuthLoadingScreen'
import { isLoggedIn } from '#/lib/client/auth'
import { useClientAuth } from '#/lib/client/auth-context/index'

export const Route = createFileRoute('/(protected)')({
    component: RouteComponent,
    beforeLoad: async () => {
        if (!(await isLoggedIn())) {
            throw redirect({ to: '/auth/login' })
        }
    },
})

function RouteComponent() {
    const { loggedIn } = useClientAuth()

    if (loggedIn !== true) {
        return <AuthLoadingScreen />
    }

    return <Outlet />
}
