import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

import { DefaultErrorComponent } from '#/components/errors/DefaultErrorComponent'
import { DefaultNotFoundComponent } from '#/components/errors/DefaultNotFoundComponent'

export function getRouter() {
    const router = createTanStackRouter({
        routeTree,
        scrollRestoration: true,
        defaultPreload: false,
        defaultErrorComponent: DefaultErrorComponent,
        defaultNotFoundComponent: DefaultNotFoundComponent,
    })

    return router
}

declare module '@tanstack/react-router' {
    interface Register {
        router: ReturnType<typeof getRouter>
    }
}
