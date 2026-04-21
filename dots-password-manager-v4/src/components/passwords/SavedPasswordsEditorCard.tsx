import type { TFunction } from 'i18next'
import { ChevronLeftIcon, LockIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
    onBack: () => void
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
    onBack,
    onChange,
    onReset,
    onSave,
    onDelete,
    t,
}: SavedPasswordsEditorCardProps) {
    const { t: tc } = useTranslation('common')
    return (
        <Card>
            <CardHeader>
                {loadingSelected ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="-ml-2 w-fit gap-1"
                        >
                            <ChevronLeftIcon className="size-4" />
                            {tc('go_back')}
                        </Button>
                        <LockIcon className="size-5 text-muted-foreground" />
                    </div>
                )}
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
                ) : draft ? (
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
                ) : null}
            </CardContent>
        </Card>
    )
}
