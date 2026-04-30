import { useTranslation } from 'react-i18next'

import { Spinner } from '#/components/ui/spinner'

export function AuthLoadingScreen() {
    const { t } = useTranslation('common')

    return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
            <Spinner className="size-5" />
            <p>{t('auth_loading')}</p>
        </div>
    )
}
