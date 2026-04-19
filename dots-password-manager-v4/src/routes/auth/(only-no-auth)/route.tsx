import { isLoggedIn } from '#/lib/client/auth'
import { useClientAuth } from '#/lib/client/auth-context'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/(only-no-auth)')({
    component: RouteComponent,
    beforeLoad: async () => {
        const isLoggedInResult = await isLoggedIn()
        console.log(isLoggedInResult)
        if (isLoggedInResult) {
            throw redirect({ to: '/saved-passwords' })
        }
    },
})

function RouteComponent() {
    const { loggedIn } = useClientAuth()
    if (loggedIn) {
        return
    }
    return <Outlet />
}
