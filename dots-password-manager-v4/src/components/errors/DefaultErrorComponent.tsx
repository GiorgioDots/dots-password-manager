import type { ErrorComponentProps } from '@tanstack/react-router'
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
    return (
        <ErrorLayout
            title="Something went wrong"
            message="The page failed to load correctly. You can retry or go back to the vault home."
            details={formatErrorDetails(props)}
            actionLabel="Go home"
            actionTo="/"
            showReload
            onRetry={props.reset}
        />
    )
}
