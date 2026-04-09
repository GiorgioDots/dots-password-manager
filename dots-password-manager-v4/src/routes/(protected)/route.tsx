import { isLoggedIn } from '#/lib/client/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)')({
    component: RouteComponent,
    beforeLoad: () => {
        if (typeof window === 'undefined') {
            return
        }

        if (!isLoggedIn()) {
            throw redirect({ to: '/auth/login' })
        }
    },
})

function RouteComponent() {
    return <Outlet />
}
