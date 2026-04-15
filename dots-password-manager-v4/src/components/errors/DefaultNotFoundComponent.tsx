import type { NotFoundRouteProps } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

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
    const { t } = useTranslation('error')
    return (
        <ErrorLayout
            title={t('not_found_title')}
            message={t('not_found_message')}
            details={formatNotFoundDetails(props)}
            actionLabel={t('not_found_action')}
            actionTo="/"
        />
    )
}
