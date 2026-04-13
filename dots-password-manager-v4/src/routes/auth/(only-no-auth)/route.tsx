import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { isLoggedIn } from '#/lib/client/auth'

export const Route = createFileRoute('/auth/(only-no-auth)')({
    component: RouteComponent,
    beforeLoad: async () => {
        if (await isLoggedIn()) {
            throw redirect({ to: '/saved-passwords' })
        }
    },
})

function RouteComponent() {
    return <Outlet />
}
