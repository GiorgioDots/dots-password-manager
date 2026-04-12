import { isLoggedIn } from '#/lib/client/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)')({
    component: RouteComponent,
    beforeLoad: async () => {
        if (!(await isLoggedIn())) {
            throw redirect({ to: '/auth/login' })
        }
    },
})

function RouteComponent() {
    return <Outlet />
}
