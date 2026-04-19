import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type SavedPasswordsPageHeaderProps = {
    title: string | null
    onOpenVault: () => void
    onAddNew: () => void
}

export function SavedPasswordsPageHeader({
    title,
    onOpenVault,
    onAddNew,
}: SavedPasswordsPageHeaderProps) {
    const { t } = useTranslation('vault')

    return (
        <div className="mb-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-4">
            <h1
                className={cn(
                    'min-h-7 text-xl font-semibold capitalize',
                    title ? 'visible' : 'hidden',
                )}
            >
                {title ?? ''}
            </h1>
            <div className="ml-auto flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Button type="button" onClick={onOpenVault} className="w-full sm:w-auto">
                    {t('open_vault_button')}
                    <span className="ml-2 hidden rounded-sm bg-card p-0.5 text-xs text-foreground sm:inline">
                        {t('open_vault_shortcut')}
                    </span>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onAddNew}
                    className="w-full sm:w-auto"
                >
                    <PlusIcon className="size-4" />
                    {t('add_password_button')}
                </Button>
            </div>
        </div>
    )
}
