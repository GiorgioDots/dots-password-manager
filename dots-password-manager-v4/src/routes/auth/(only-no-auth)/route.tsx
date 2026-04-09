import { isLoggedIn } from '#/lib/client/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/(only-no-auth)')({
    component: RouteComponent,
    beforeLoad: () => {
        if (typeof window !== 'undefined' && isLoggedIn()) {
            throw redirect({ to: '/saved-passwords' })
        }
    },
})

function RouteComponent() {
    return <Outlet />
}
