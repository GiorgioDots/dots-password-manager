import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'

import { SavedPasswordsEditorCard } from '#/components/passwords/SavedPasswordsEditorCard'
import { SavedPasswordsEmptyState } from '#/components/passwords/SavedPasswordsEmptyState'
import {
    useCreatePasswordMutation,
    useDeletePasswordMutation,
    useEditPasswordMutation,
    usePasswordByIdQuery,
    usePasswordsQuery,
    useTogglePasswordFavouriteMutation,
} from '#/lib/client/queries/passwords'
import type { SavedPasswordDto } from '#/lib/shared/passwords/contracts'
import {
    createEmptyPasswordDraft,
    normalizeSavedPassword,
    serializePasswordDraft,
    splitPasswordsByFavourite,
} from '#/lib/shared/passwords/editor'

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

    const syncSelectedIdToSearch = useCallback(
        (id: string | null) => {
            navigate({
                to: '/saved-passwords',
                search: id ? { id } : {},
                replace: true,
            }).catch(() => undefined)
        },
        [navigate],
    )

    const selectPassword = useCallback(
        (id: string, opts?: { syncUrl?: boolean; silent?: boolean }) => {
            silentSelectionRef.current = !!opts?.silent
            setSelectedId(id)
            if (opts?.syncUrl !== false) {
                syncSelectedIdToSearch(id)
            }
        },
        [syncSelectedIdToSearch],
    )

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

        const nextDraft = normalizeSavedPassword(selectedPasswordQuery.data)
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
        return serializePasswordDraft(draft) !== serializePasswordDraft(initialDraft)
    }, [draft, initialDraft])

    const canSave =
        !!draft && !!draft.Name.trim() && !!draft.Login.trim() && !!draft.Password.trim() && isDirty

    const canReset = !!draft && isDirty

    const onSave = useCallback(async () => {
        if (!draft || !canSave) {
            return
        }

        try {
            if (draft.PasswordId) {
                const updated = await editPasswordMutation.mutateAsync(draft)
                const nextDraft = normalizeSavedPassword(updated)

                setDraft(nextDraft)
                setInitialDraft(nextDraft)
                toast.success(t('toast_updated'))
                return
            }

            const created = await createPasswordMutation.mutateAsync(draft)
            const nextDraft = normalizeSavedPassword(created)

            setSelectedId(created.PasswordId ?? null)
            setDraft(nextDraft)
            setInitialDraft(nextDraft)
            syncSelectedIdToSearch(created.PasswordId ?? null)
            toast.success(t('toast_created'))
        } catch {
            toast.error(t('toast_save_failed'))
        }
    }, [canSave, createPasswordMutation, draft, editPasswordMutation, syncSelectedIdToSearch, t])

    const onDelete = useCallback(
        async (id: string | undefined) => {
            if (!id) {
                return
            }

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
        },
        [deletePasswordMutation, selectedId, syncSelectedIdToSearch, t],
    )

    const onToggleFavourite = useCallback(
        async (id: string) => {
            try {
                const updated = await toggleFavouriteMutation.mutateAsync(id)

                if (selectedId === updated.PasswordId) {
                    setDraft((prev) =>
                        prev ? { ...prev, IsFavourite: updated.IsFavourite } : prev,
                    )
                    setInitialDraft((prev) =>
                        prev ? { ...prev, IsFavourite: updated.IsFavourite } : prev,
                    )
                }
            } catch {
                toast.error(t('toast_toggle_favourite_failed'))
            }
        },
        [selectedId, t, toggleFavouriteMutation],
    )

    const onAddNew = useCallback(() => {
        const empty = createEmptyPasswordDraft()
        setSelectedId(null)
        setDraft(empty)
        setInitialDraft(empty)
        syncSelectedIdToSearch(null)
    }, [syncSelectedIdToSearch])

    const updateDraft = useCallback((patch: Partial<SavedPasswordDto>) => {
        setDraft((prev) => {
            if (!prev) {
                return prev
            }

            return {
                ...prev,
                ...patch,
            }
        })
    }, [])

    const onResetDraft = useCallback(() => {
        if (!initialDraft) {
            return
        }

        setDraft(normalizeSavedPassword(initialDraft))
    }, [initialDraft])

    const onBack = useCallback(() => {
        setSelectedId(null)
        setDraft(null)
        setInitialDraft(null)
        syncSelectedIdToSearch(null)
    }, [syncSelectedIdToSearch])

    const { hasFavourites, favouritePasswords, otherPasswords } = useMemo(
        () => splitPasswordsByFavourite(passwords),
        [passwords],
    )

    const openCommandDialog = useCallback(() => {
        setCommandOpen(true)
    }, [])

    return (
        <main className="flex flex-col mx-auto w-full max-w-5xl px-4 pt-4 pb-8 sm:pb-10">
            {!loadingSelected && !draft ? (
                <SavedPasswordsEmptyState
                    onOpenVault={openCommandDialog}
                    onAddNew={onAddNew}
                    t={t}
                />
            ) : (
                <SavedPasswordsEditorCard
                    loadingSelected={loadingSelected}
                    draft={draft}
                    selectedId={selectedId}
                    canSave={canSave}
                    canReset={canReset}
                    onBack={onBack}
                    onChange={updateDraft}
                    onReset={onResetDraft}
                    onSave={onSave}
                    onDelete={onDelete}
                    t={t}
                />
            )}

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
        </main>
    )
}
