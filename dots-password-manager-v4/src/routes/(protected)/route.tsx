import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { isLoggedIn } from '#/lib/client/auth'

export const Route = createFileRoute('/(protected)')({
    component: RouteComponent,
    beforeLoad: async () => {
        console.log('Checking auth state in protected route beforeLoad...')
        if (!(await isLoggedIn())) {
            throw redirect({ to: '/auth/login' })
        }
    },
})

function RouteComponent() {
    return <Outlet />
}
