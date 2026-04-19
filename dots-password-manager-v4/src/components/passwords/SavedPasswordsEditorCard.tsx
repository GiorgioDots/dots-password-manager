import type { TFunction } from 'i18next'

import PasswordEditForm from './PasswordEditForm'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import type { SavedPasswordDto } from '#/lib/shared/passwords/contracts'

type SavedPasswordsEditorCardProps = {
    loadingSelected: boolean
    draft: SavedPasswordDto | null
    selectedId: string | null
    canSave: boolean
    canReset: boolean
    onOpenVault: () => void
    onAddNew: () => void
    onChange: (patch: Partial<SavedPasswordDto>) => void
    onReset: () => void
    onSave: () => Promise<void>
    onDelete: (id: string | undefined) => Promise<void>
    t: TFunction<'vault'>
}

export function SavedPasswordsEditorCard({
    loadingSelected,
    draft,
    selectedId,
    canSave,
    canReset,
    onOpenVault,
    onAddNew,
    onChange,
    onReset,
    onSave,
    onDelete,
    t,
}: SavedPasswordsEditorCardProps) {
    return (
        <Card>
            <CardHeader>
                {loadingSelected ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
                {loadingSelected ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Skeleton className="h-10 w-full sm:w-20" />
                            <Skeleton className="h-10 w-full sm:w-24" />
                        </div>
                    </div>
                ) : !draft ? (
                    <div className="rounded-lg border border-dashed p-6 text-center sm:p-8">
                        <h2 className="text-lg font-medium">{t('empty_state_title')}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('empty_state_message')}
                        </p>
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                            <Button
                                type="button"
                                onClick={onOpenVault}
                                className="w-full sm:w-auto"
                            >
                                {t('open_vault_button')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onAddNew}
                                className="w-full sm:w-auto"
                            >
                                {t('add_password_button')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <PasswordEditForm
                        draft={draft}
                        selectedId={selectedId}
                        canSave={canSave}
                        canReset={canReset}
                        onChange={onChange}
                        onReset={onReset}
                        onSave={onSave}
                        onDelete={onDelete}
                    />
                )}
            </CardContent>
        </Card>
    )
}
