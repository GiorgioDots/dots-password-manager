import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  StarIcon,
} from 'lucide-react'
import { toast } from 'sonner'

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
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { isLoggedIn } from '#/lib/client-auth'
import {
  createPassword,
  deletePassword,
  editPassword,
  getPasswordById,
  getPasswords,
  togglePasswordFavourite,
} from '#/lib/passwords/client'
import type { SavedPasswordDto } from '#/lib/passwords/contracts'

export const Route = createFileRoute('/saved-passwords')({
  beforeLoad: () => {
    if (typeof window === 'undefined') {
      return
    }

    if (!isLoggedIn()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: SavedPasswordsPage,
})

function SavedPasswordsPage() {
  const [passwords, setPasswords] = useState<SavedPasswordDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSelected, setLoadingSelected] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [draft, setDraft] = useState<SavedPasswordDto | null>(null)
  const [initialDraft, setInitialDraft] = useState<SavedPasswordDto | null>(
    null,
  )
  const copiedResetTimeoutRef = useRef<number | null>(null)

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

  async function selectPassword(id: string) {
    setSelectedId(id)
    setLoadingSelected(true)

    try {
      const item = await getPasswordById(id)
      const nextDraft = normalize(item)
      setDraft(nextDraft)
      setInitialDraft(nextDraft)
    } catch {
      toast.error('Unable to load selected password.')
    } finally {
      setLoadingSelected(false)
    }
  }

  async function loadPasswords() {
    setLoading(true)
    try {
      const items = await getPasswords()
      setPasswords(items)

      setSelectedId(null)
      setDraft(null)
      setInitialDraft(null)
    } catch {
      toast.error('Unable to load passwords.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPasswords()
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

  useEffect(() => {
    return () => {
      if (copiedResetTimeoutRef.current) {
        window.clearTimeout(copiedResetTimeoutRef.current)
      }
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

  async function onSave() {
    if (!draft || !canSave) {
      return
    }

    try {
      if (draft.PasswordId) {
        const updated = await editPassword(draft)
        setPasswords((prev) =>
          prev.map((p) => (p.PasswordId === updated.PasswordId ? updated : p)),
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
    setIsPasswordVisible(false)
    setDraft(empty)
    setInitialDraft(empty)
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

  const tagsString = (draft?.Tags ?? []).join(', ')

  async function copyValue(value: string, label: string, fieldKey: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(fieldKey)
      if (copiedResetTimeoutRef.current) {
        window.clearTimeout(copiedResetTimeoutRef.current)
      }
      copiedResetTimeoutRef.current = window.setTimeout(() => {
        setCopiedField((prev) => (prev === fieldKey ? null : prev))
      }, 1200)
      toast.success(`${label} copied.`)
    } catch {
      toast.error(`Unable to copy ${label.toLowerCase()}.`)
    }
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
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-6 sm:pb-10 sm:pt-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="min-h-7 text-xl font-semibold capitalize">
          {selectedId ? (draft?.Name ?? '') : ''}
        </h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCommandOpen(true)}
            className="w-full justify-between sm:w-auto"
          >
            Open vault
            <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
              Ctrl+K
            </span>
          </Button>
          <Button
            type="button"
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
            {loading ? 'Loading passwords...' : 'No passwords found.'}
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
                    void selectPassword(item.PasswordId)
                  }}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium capitalize">{item.Name}</span>
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
                          void onToggleFavourite(item.PasswordId)
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

          <CommandGroup heading={hasFavourites ? 'All passwords' : 'Vault'}>
            {otherPasswords.map((item) => (
              <CommandItem
                key={item.PasswordId}
                value={`${item.Name} ${item.Login} ${item.Url ?? ''}`}
                onSelect={() => {
                  if (!item.PasswordId) {
                    return
                  }

                  setCommandOpen(false)
                  void selectPassword(item.PasswordId)
                }}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium capitalize">{item.Name}</span>
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
                        void onToggleFavourite(item.PasswordId)
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
            <p className="text-xs text-muted-foreground">
              Loading selected password...
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {!draft ? (
            <div className="rounded-lg border border-dashed p-6 text-center sm:p-8">
              <h2 className="text-lg font-medium">Welcome</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add a new password or open the vault.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCommandOpen(true)}
                  className="w-full sm:w-auto"
                >
                  Open vault
                </Button>
                <Button
                  type="button"
                  onClick={onAddNew}
                  className="w-full sm:w-auto"
                >
                  Add password
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={draft.Name}
                    onChange={(e) => updateDraft({ Name: e.target.value })}
                    placeholder="Example: Github"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label="Copy name"
                    onClick={() => void copyValue(draft.Name, 'Name', 'name')}
                    className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent"
                  >
                    {copiedField === 'name' ? (
                      <CheckIcon className="size-4 text-emerald-600" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="login">Login</Label>
                <div className="relative">
                  <Input
                    id="login"
                    value={draft.Login}
                    onChange={(e) => updateDraft({ Login: e.target.value })}
                    placeholder="username or email"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label="Copy login"
                    onClick={() => void copyValue(draft.Login, 'Login', 'login')}
                    className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent"
                  >
                    {copiedField === 'login' ? (
                      <CheckIcon className="size-4 text-emerald-600" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="second-login">Second login</Label>
                <div className="relative">
                  <Input
                    id="second-login"
                    value={draft.SecondLogin ?? ''}
                    onChange={(e) =>
                      updateDraft({ SecondLogin: e.target.value || null })
                    }
                    placeholder="optional"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label="Copy second login"
                    onClick={() =>
                      void copyValue(
                        draft.SecondLogin ?? '',
                        'Second login',
                        'second-login',
                      )
                    }
                    className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent"
                  >
                    {copiedField === 'second-login' ? (
                      <CheckIcon className="size-4 text-emerald-600" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    autoComplete="off"
                    value={draft.Password}
                    onChange={(e) => updateDraft({ Password: e.target.value })}
                    placeholder="password"
                    className="pr-16"
                  />
                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    <button
                      type="button"
                      aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent"
                    >
                      {isPasswordVisible ? (
                        <EyeOffIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label="Copy password"
                      onClick={() =>
                        void copyValue(draft.Password, 'Password', 'password')
                      }
                      className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent"
                    >
                      {copiedField === 'password' ? (
                        <CheckIcon className="size-4 text-emerald-600" />
                      ) : (
                        <CopyIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="url">Url</Label>
                <div className="relative">
                  <Input
                    id="url"
                    value={draft.Url ?? ''}
                    onChange={(e) =>
                      updateDraft({ Url: e.target.value || null })
                    }
                    placeholder="https://..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label="Copy url"
                    onClick={() => void copyValue(draft.Url ?? '', 'Url', 'url')}
                    className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent"
                  >
                    {copiedField === 'url' ? (
                      <CheckIcon className="size-4 text-emerald-600" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="relative">
                  <Input
                    id="tags"
                    value={tagsString}
                    onChange={(e) =>
                      updateDraft({
                        Tags: e.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="work, personal, otp"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label="Copy tags"
                    onClick={() => void copyValue(tagsString, 'Tags', 'tags')}
                    className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent"
                  >
                    {copiedField === 'tags' ? (
                      <CheckIcon className="size-4 text-emerald-600" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <div className="relative">
                  <Textarea
                    id="notes"
                    value={draft.Notes ?? ''}
                    onChange={(e) =>
                      updateDraft({ Notes: e.target.value || null })
                    }
                    placeholder="Additional notes"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label="Copy notes"
                    onClick={() => void copyValue(draft.Notes ?? '', 'Notes', 'notes')}
                    className="absolute right-2 top-2 inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent"
                  >
                    {copiedField === 'notes' ? (
                      <CheckIcon className="size-4 text-emerald-600" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  onClick={() => void onSave()}
                  disabled={!canSave}
                  className="w-full sm:w-auto"
                >
                  Save
                </Button>

                {selectedId ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void onDelete(selectedId)}
                    className="w-full sm:w-auto"
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
