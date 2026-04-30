import type { ErrorComponentProps } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { ErrorLayout } from './ErrorLayout'

function formatErrorDetails({ error, info }: ErrorComponentProps) {
    const stackDetails = info?.componentStack ? `\n\nComponent stack:\n${info.componentStack}` : ''

    if (error instanceof Error) {
        const errorText = [error.name, error.message, error.stack].filter(Boolean).join('\n')

        return `${errorText}${stackDetails}`
    }

    if (typeof error === 'string') {
        return `${error}${stackDetails}`
    }

    try {
        return `${JSON.stringify(error, null, 2)}${stackDetails}`
    } catch {
        return `${String(error)}${stackDetails}`
    }
}

export function DefaultErrorComponent(props: ErrorComponentProps) {
    const { t } = useTranslation('error')
    return (
        <ErrorLayout
            title={t('generic_title')}
            message={t('generic_message')}
            details={formatErrorDetails(props)}
            actionLabel={t('generic_action')}
            actionTo="/"
            showReload
            onRetry={props.reset}
        />
    )
}
