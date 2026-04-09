import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PlusIcon, StarIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'

import PasswordEditForm from '#/components/PasswordEditForm'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '#/components/ui/command'
import { Skeleton } from '#/components/ui/skeleton'
import {
    createPassword,
    deletePassword,
    editPassword,
    getPasswordById,
    getPasswords,
    togglePasswordFavourite,
} from '#/lib/passwords/client'
import type { SavedPasswordDto } from '#/lib/passwords/contracts'

export const Route = createFileRoute('/(protected)/saved-passwords/')({
    validateSearch: z.object({
        id: z.string().optional(),
    }),
    component: SavedPasswordsPage,
})

function SavedPasswordsPage() {
    const navigate = useNavigate({ from: '/saved-passwords/' })
    const search = Route.useSearch()

    const [passwords, setPasswords] = useState<SavedPasswordDto[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingSelected, setLoadingSelected] = useState(false)
    const [commandOpen, setCommandOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [draft, setDraft] = useState<SavedPasswordDto | null>(null)
    const [initialDraft, setInitialDraft] = useState<SavedPasswordDto | null>(
        null,
    )

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
            Tags: (item.Tags ?? []).map((t) => t.trim()).filter(Boolean),
            IsFavourite: item.IsFavourite ?? false,
        })
    }

    function syncSelectedIdToSearch(id: string | null) {
        navigate({
            search: id ? { id } : {},
            replace: true,
        }).catch(() => undefined)
    }

    async function selectPassword(
        id: string,
        opts?: { syncUrl?: boolean; silent?: boolean },
    ) {
        setSelectedId(id)
        setLoadingSelected(true)

        try {
            const item = await getPasswordById(id)
            const nextDraft = normalize(item)
            setDraft(nextDraft)
            setInitialDraft(nextDraft)
            if (opts?.syncUrl !== false) {
                syncSelectedIdToSearch(id)
            }
        } catch {
            if (!opts?.silent) {
                toast.error('Unable to load selected password.')
            }
            setSelectedId(null)
            setDraft(null)
            setInitialDraft(null)
            syncSelectedIdToSearch(null)
        } finally {
            setLoadingSelected(false)
        }
    }

    async function loadPasswords() {
        setLoading(true)
        try {
            const items = await getPasswords()
            setPasswords(items)

            if (search.id) {
                await selectPassword(search.id, {
                    syncUrl: false,
                    silent: true,
                })
            } else {
                setSelectedId(null)
                setDraft(null)
                setInitialDraft(null)
            }
        } catch {
            toast.error('Unable to load passwords.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPasswords().catch(() => undefined)
    }, [])

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
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
        !!draft &&
        !!draft.Name.trim() &&
        !!draft.Login.trim() &&
        !!draft.Password.trim() &&
        isDirty

    const canReset = !!draft && isDirty

    async function onSave() {
        if (!draft || !canSave) {
            return
        }

        try {
            if (draft.PasswordId) {
                const updated = await editPassword(draft)
                setPasswords((prev) =>
                    prev.map((p) =>
                        p.PasswordId === updated.PasswordId ? updated : p,
                    ),
                )

                const nextDraft = normalize(updated)
                setDraft(nextDraft)
                setInitialDraft(nextDraft)
                toast.success('Password updated.')
                return
            }

            const created = await createPassword(draft)
            setPasswords((prev) => [created, ...prev])

            const nextDraft = normalize(created)
            setSelectedId(created.PasswordId ?? null)
            setDraft(nextDraft)
            setInitialDraft(nextDraft)
            syncSelectedIdToSearch(created.PasswordId ?? null)
            toast.success('Password created.')
        } catch {
            toast.error('Unable to save password.')
        }
    }

    async function onDelete(id: string | undefined) {
        if (!id) return

        try {
            await deletePassword(id)
            setPasswords((prev) => prev.filter((p) => p.PasswordId !== id))
            if (selectedId === id) {
                setSelectedId(null)
                setDraft(null)
                setInitialDraft(null)
                syncSelectedIdToSearch(null)
            }
        } catch {
            toast.error('Unable to delete password.')
        }
    }

    async function onToggleFavourite(id: string) {
        try {
            const updated = await togglePasswordFavourite(id)

            setPasswords((prev) =>
                prev.map((p) =>
                    p.PasswordId === updated.PasswordId
                        ? { ...p, IsFavourite: updated.IsFavourite }
                        : p,
                ),
            )

            if (selectedId === updated.PasswordId) {
                setDraft((prev) =>
                    prev ? { ...prev, IsFavourite: updated.IsFavourite } : prev,
                )
                setInitialDraft((prev) =>
                    prev ? { ...prev, IsFavourite: updated.IsFavourite } : prev,
                )
            }
        } catch {
            toast.error('Unable to toggle favourite.')
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
    const favouritePasswords = orderedPasswords.filter(
        (item) => item.IsFavourite,
    )
    const otherPasswords = orderedPasswords.filter((item) => !item.IsFavourite)

    return (
        <main className="mx-auto w-full max-w-5xl px-4 pb-8 sm:pb-10 pt-4">
            <div className="mb-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <h1 className="min-h-7 text-xl font-semibold capitalize">
                    {selectedId ? (draft?.Name ?? '') : ''}
                </h1>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button
                        type="button"
                        onClick={() => setCommandOpen(true)}
                        className="w-full justify-between sm:w-auto"
                    >
                        Open vault
                        <span className="ml-2 text-xs text-foreground bg-background p-0.5 rounded-sm hidden sm:inline">
                            Ctrl+K
                        </span>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onAddNew}
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        <PlusIcon className="size-4" />
                        Add password
                    </Button>
                </div>
            </div>

            <CommandDialog
                open={commandOpen}
                onOpenChange={setCommandOpen}
                title="Select a password"
                description="Search your vault and open a password entry."
                className="w-[calc(100vw-2rem)] max-w-xl"
            >
                <CommandInput placeholder="Search by name, login or url..." />
                <CommandList className="max-h-[min(50vh,420px)]">
                    <CommandEmpty>
                        {loading
                            ? 'Loading passwords...'
                            : 'No passwords found.'}
                    </CommandEmpty>
                    {hasFavourites ? (
                        <CommandGroup heading="Favourites">
                            {favouritePasswords.map((item) => (
                                <CommandItem
                                    key={item.PasswordId}
                                    value={`${item.Name} ${item.Login} ${item.Url ?? ''}`}
                                    onSelect={() => {
                                        if (!item.PasswordId) {
                                            return
                                        }

                                        setCommandOpen(false)
                                        selectPassword(item.PasswordId).catch(
                                            () => undefined,
                                        )
                                    }}
                                >
                                    <div className="flex w-full items-center justify-between gap-2">
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-medium capitalize">
                                                {item.Name}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {item.Url || 'No url'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            aria-label="Toggle favourite"
                                            onMouseDown={(event) => {
                                                event.preventDefault()
                                                event.stopPropagation()
                                            }}
                                            onClick={(event) => {
                                                event.preventDefault()
                                                event.stopPropagation()
                                                if (item.PasswordId) {
                                                    onToggleFavourite(
                                                        item.PasswordId,
                                                    ).catch(() => undefined)
                                                }
                                            }}
                                            className="inline-flex size-7 items-center justify-center rounded-md text-yellow-500 hover:bg-accent"
                                        >
                                            <StarIcon className="size-4 fill-current" />
                                        </button>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : null}

                    <CommandGroup
                        heading={hasFavourites ? 'All passwords' : 'Vault'}
                    >
                        {otherPasswords.map((item) => (
                            <CommandItem
                                key={item.PasswordId}
                                value={`${item.Name} ${item.Login} ${item.Url ?? ''}`}
                                onSelect={() => {
                                    if (!item.PasswordId) {
                                        return
                                    }

                                    setCommandOpen(false)
                                    selectPassword(item.PasswordId).catch(
                                        () => undefined,
                                    )
                                }}
                            >
                                <div className="flex w-full items-center justify-between gap-2">
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate font-medium capitalize">
                                            {item.Name}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {item.Url || 'No url'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="Toggle favourite"
                                        onMouseDown={(event) => {
                                            event.preventDefault()
                                            event.stopPropagation()
                                        }}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            event.stopPropagation()
                                            if (item.PasswordId) {
                                                onToggleFavourite(
                                                    item.PasswordId,
                                                ).catch(() => undefined)
                                            }
                                        }}
                                        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                                    >
                                        <StarIcon className="size-4" />
                                    </button>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>

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
                            <h2 className="text-lg font-medium">Welcome</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Add a new password or open the vault.
                            </p>
                            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                                <Button
                                    type="button"
                                    onClick={() => setCommandOpen(true)}
                                    className="w-full sm:w-auto"
                                >
                                    Open vault
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onAddNew}
                                    className="w-full sm:w-auto"
                                >
                                    <PlusIcon className="size-4" />
                                    Add password
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
        </main>
    )
}
