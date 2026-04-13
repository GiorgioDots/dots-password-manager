import type { NotFoundRouteProps } from '@tanstack/react-router'

import { ErrorLayout } from './ErrorLayout'

function formatNotFoundDetails({ routeId, data }: NotFoundRouteProps) {
    const prefix = `routeId: ${routeId}`

    if (data == null) {
        return prefix
    }

    if (typeof data === 'string') {
        return `${prefix}\n${data}`
    }

    try {
        return `${prefix}\n${JSON.stringify(data, null, 2)}`
    } catch {
        return `${prefix}\n${String(data)}`
    }
}

export function DefaultNotFoundComponent(props: NotFoundRouteProps) {
    return (
        <ErrorLayout
            title="Page not found"
            message="This route does not exist or may have been moved."
            details={formatNotFoundDetails(props)}
            actionLabel="Back to home"
            actionTo="/"
        />
    )
}
