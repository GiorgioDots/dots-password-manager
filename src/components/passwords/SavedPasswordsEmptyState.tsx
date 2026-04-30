import type { TFunction } from 'i18next'
import { CommandIcon, PlusIcon, VaultIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

type SavedPasswordsEmptyStateProps = {
    onOpenVault: () => void
    onAddNew: () => void
    t: TFunction<'vault'>
}

export function SavedPasswordsEmptyState({
    onOpenVault,
    onAddNew,
    t,
}: SavedPasswordsEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        {t('empty_state_title')}
                    </CardTitle>
                    <CardDescription>{t('empty_state_message')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3 ">
                        <Button size="lg" onClick={onOpenVault} className="gap-2">
                            <CommandIcon className="size-5 hidden lg:block" />
                            <VaultIcon className="size-5 block lg:hidden" />
                            {t('open_vault_button')}
                        </Button>
                        <Button size="lg" variant="outline" onClick={onAddNew} className="gap-2">
                            <PlusIcon className="size-5" />
                            {t('add_password_button')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
