import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function ErrorLayout({
    title,
    message,
    details,
    actionLabel,
    actionTo,
    showReload,
    onRetry,
}: {
    title: string
    message: string
    details?: string
    actionLabel: string
    actionTo: '/'
    showReload?: boolean
    onRetry?: () => void
}) {
    const { t } = useTranslation(['common', 'error'])
    return (
        <main className="h-full flex min-h-[60vh] items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    {t('common:app_name')}
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
                {details ? (
                    <pre className="mt-4 max-h-56 overflow-auto rounded-md border border-border bg-muted p-3 text-left text-xs whitespace-pre-wrap wrap-break-words">
                        {details}
                    </pre>
                ) : null}

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Link
                        to={actionTo}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground no-underline transition-opacity hover:opacity-90"
                    >
                        {actionLabel}
                    </Link>
                    {showReload ? (
                        <button
                            type="button"
                            onClick={onRetry ?? (() => window.location.reload())}
                            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium"
                        >
                            {t('error:retry_button')}
                        </button>
                    ) : null}
                </div>
            </div>
        </main>
    )
}
