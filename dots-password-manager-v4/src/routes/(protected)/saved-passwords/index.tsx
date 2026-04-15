import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'

import PasswordEditForm from '#/components/passwords/PasswordEditForm'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import {
    useCreatePasswordMutation,
    useDeletePasswordMutation,
    useEditPasswordMutation,
    usePasswordByIdQuery,
    usePasswordsQuery,
    useTogglePasswordFavouriteMutation,
} from '#/lib/client/queries/passwords'
import type { SavedPasswordDto } from '#/lib/shared/passwords/contracts'
import { cn } from '#/lib/utils'

const VaultCommandDialog = lazy(() => import('#/components/passwords/VaultCommandDialog'))

export const Route = createFileRoute('/(protected)/saved-passwords/')({
    validateSearch: z.object({
        id: z.string().optional(),
    }),
    component: SavedPasswordsPage,
})

function SavedPasswordsPage() {
    const navigate = useNavigate()
    const { t } = useTranslation('vault')
    const search = Route.useSearch()

    const [commandOpen, setCommandOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(search.id ?? null)
    const [draft, setDraft] = useState<SavedPasswordDto | null>(null)
    const [initialDraft, setInitialDraft] = useState<SavedPasswordDto | null>(null)
    const silentSelectionRef = useRef(false)

    function normalize(item: SavedPasswordDto): SavedPasswordDto {
        return {
            PasswordId: item.PasswordId,
            Name: item.Name,
            Login: item.Login,
            SecondLogin: item.SecondLogin ?? null,
            Password: item.Password,
            Url: item.Url ?? null,
            Notes: item.Notes ?? null,
            Tags: item.Tags ?? [],
            IsFavourite: item.IsFavourite ?? false,
            CreatedAt: item.CreatedAt,
            UpdatedAt: item.UpdatedAt,
        }
    }

    function toComparable(item: SavedPasswordDto | null): string {
        if (!item) {
            return ''
        }

        return JSON.stringify({
            PasswordId: item.PasswordId ?? null,
            Name: item.Name.trim(),
            Login: item.Login.trim(),
            SecondLogin: item.SecondLogin?.trim() || '',
            Password: item.Password,
            Url: item.Url?.trim() || '',
            Notes: item.Notes?.trim() || '',
            Tags: (item.Tags ?? []).map((tag) => tag.trim()).filter(Boolean),
            IsFavourite: item.IsFavourite ?? false,
        })
    }

    function syncSelectedIdToSearch(id: string | null) {
        navigate({
            to: '/saved-passwords',
            search: id ? { id } : {},
            replace: true,
        }).catch(() => undefined)
    }

    function selectPassword(id: string, opts?: { syncUrl?: boolean; silent?: boolean }) {
        silentSelectionRef.current = !!opts?.silent
        setSelectedId(id)
        if (opts?.syncUrl !== false) {
            syncSelectedIdToSearch(id)
        }
    }

    const passwordsQuery = usePasswordsQuery()
    const selectedPasswordQuery = usePasswordByIdQuery(selectedId)
    const createPasswordMutation = useCreatePasswordMutation()
    const editPasswordMutation = useEditPasswordMutation()
    const deletePasswordMutation = useDeletePasswordMutation()
    const toggleFavouriteMutation = useTogglePasswordFavouriteMutation()

    const passwords = passwordsQuery.data ?? []
    const loading = passwordsQuery.isLoading
    const loadingSelected = !!selectedId && selectedPasswordQuery.isFetching

    useEffect(() => {
        const nextSelectedId = search.id ?? null

        // Ignore one stale search tick while opening a new unsaved draft.
        if (!selectedId && !!nextSelectedId && draft !== null && !draft.PasswordId) {
            return
        }

        if (nextSelectedId === selectedId) {
            return
        }

        silentSelectionRef.current = true
        setSelectedId(nextSelectedId)

        if (!nextSelectedId && draft?.PasswordId) {
            setDraft(null)
            setInitialDraft(null)
        }
    }, [search.id, selectedId, draft])

    useEffect(() => {
        if (!selectedId || !selectedPasswordQuery.data) {
            return
        }

        const nextDraft = normalize(selectedPasswordQuery.data)
        setDraft(nextDraft)
        setInitialDraft(nextDraft)
    }, [selectedId, selectedPasswordQuery.data])

    useEffect(() => {
        if (!selectedId || !selectedPasswordQuery.isError) {
            return
        }

        if (!silentSelectionRef.current) {
            toast.error(t('toast_load_selected_failed'))
        }

        silentSelectionRef.current = false
        setSelectedId(null)
        setDraft(null)
        setInitialDraft(null)
        syncSelectedIdToSearch(null)
    }, [selectedId, selectedPasswordQuery.isError])

    useEffect(() => {
        if (!passwordsQuery.isError) {
            return
        }

        toast.error(t('toast_load_failed'))
    }, [passwordsQuery.isError])

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (!event.key) return
            const key = event.key.toLowerCase()
            if ((event.ctrlKey || event.metaKey) && key === 'k') {
                event.preventDefault()
                setCommandOpen((open) => !open)
            }
        }

        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [])

    const isDirty = useMemo(() => {
        return toComparable(draft) !== toComparable(initialDraft)
    }, [draft, initialDraft])

    const canSave =
        !!draft && !!draft.Name.trim() && !!draft.Login.trim() && !!draft.Password.trim() && isDirty

    const canReset = !!draft && isDirty

    async function onSave() {
        if (!draft || !canSave) {
            return
        }

        try {
            if (draft.PasswordId) {
                const updated = await editPasswordMutation.mutateAsync(draft)

                const nextDraft = normalize(updated)
                setDraft(nextDraft)
                setInitialDraft(nextDraft)
                toast.success(t('toast_updated'))
                return
            }

            const created = await createPasswordMutation.mutateAsync(draft)

            const nextDraft = normalize(created)
            setSelectedId(created.PasswordId ?? null)
            setDraft(nextDraft)
            setInitialDraft(nextDraft)
            syncSelectedIdToSearch(created.PasswordId ?? null)
            toast.success(t('toast_created'))
        } catch {
            toast.error(t('toast_save_failed'))
        }
    }

    async function onDelete(id: string | undefined) {
        if (!id) return

        try {
            await deletePasswordMutation.mutateAsync(id)
            if (selectedId === id) {
                setSelectedId(null)
                setDraft(null)
                setInitialDraft(null)
                syncSelectedIdToSearch(null)
            }
        } catch {
            toast.error(t('toast_delete_failed'))
        }
    }

    async function onToggleFavourite(id: string) {
        try {
            const updated = await toggleFavouriteMutation.mutateAsync(id)

            if (selectedId === updated.PasswordId) {
                setDraft((prev) => (prev ? { ...prev, IsFavourite: updated.IsFavourite } : prev))
                setInitialDraft((prev) =>
                    prev ? { ...prev, IsFavourite: updated.IsFavourite } : prev,
                )
            }
        } catch {
            toast.error(t('toast_toggle_favourite_failed'))
        }
    }

    function onAddNew() {
        const empty: SavedPasswordDto = {
            Name: '',
            Login: '',
            SecondLogin: null,
            Password: '',
            Url: null,
            Notes: null,
            Tags: [],
            IsFavourite: false,
        }

        setSelectedId(null)
        setDraft(empty)
        setInitialDraft(empty)
        syncSelectedIdToSearch(null)
    }

    function updateDraft(patch: Partial<SavedPasswordDto>) {
        setDraft((prev) => {
            if (!prev) {
                return prev
            }
            return {
                ...prev,
                ...patch,
            }
        })
    }

    function onResetDraft() {
        if (!initialDraft) {
            return
        }

        const nextDraft = normalize(initialDraft)
        setDraft(nextDraft)
    }

    const orderedPasswords = useMemo(() => {
        return [...passwords].sort((a, b) => {
            const favA = a.IsFavourite ? 1 : 0
            const favB = b.IsFavourite ? 1 : 0
            if (favA !== favB) {
                return favB - favA
            }

            return a.Name.localeCompare(b.Name)
        })
    }, [passwords])

    const hasFavourites = orderedPasswords.some((item) => item.IsFavourite)
    const favouritePasswords = orderedPasswords.filter((item) => item.IsFavourite)
    const otherPasswords = orderedPasswords.filter((item) => !item.IsFavourite)

    return (
        <main className="mx-auto w-full max-w-5xl px-4 pb-8 sm:pb-10 pt-4">
            <div className="mb-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-4">
                <h1
                    className={cn(
                        'min-h-7 text-xl font-semibold capitalize',
                        selectedId ? 'visible' : 'hidden',
                    )}
                >
                    {selectedId ? (draft?.Name ?? '') : ''}
                </h1>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center ml-auto">
                    <Button
                        type="button"
                        onClick={() => setCommandOpen(true)}
                        className="w-full sm:w-auto"
                    >
                        {t('open_vault_button')}
                        <span className="ml-2 text-xs text-foreground bg-card p-0.5 rounded-sm hidden sm:inline">
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
                                    onClick={() => setCommandOpen(true)}
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
                                    <PlusIcon className="size-4" />
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
                            onChange={updateDraft}
                            onReset={onResetDraft}
                            onSave={() => onSave()}
                            onDelete={(id) => onDelete(id)}
                        />
                    )}
                </CardContent>
            </Card>

            {commandOpen ? (
                <Suspense fallback={null}>
                    <VaultCommandDialog
                        open={commandOpen}
                        loading={loading}
                        hasFavourites={hasFavourites}
                        favouritePasswords={favouritePasswords}
                        otherPasswords={otherPasswords}
                        onOpenChange={setCommandOpen}
                        onSelectPassword={selectPassword}
                        onToggleFavourite={onToggleFavourite}
                    />
                </Suspense>
            ) : null}
        </main>
    )
}
