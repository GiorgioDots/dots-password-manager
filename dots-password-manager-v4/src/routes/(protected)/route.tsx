import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { isLoggedIn } from '#/lib/client/auth'
import { useClientAuth } from '#/lib/client/auth-context'

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
    if (!loggedIn) {
        return
    }
    return <Outlet />
}
