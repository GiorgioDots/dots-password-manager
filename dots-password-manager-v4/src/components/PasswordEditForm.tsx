import { useEffect, useRef, useState } from 'react'
import {
    CheckIcon,
    CopyIcon,
    EyeIcon,
    EyeOffIcon,
    RefreshCwIcon,
    XIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import type { SavedPasswordDto } from '#/lib/shared/passwords/contracts'

type PasswordEditFormProps = {
    draft: SavedPasswordDto
    selectedId: string | null
    canSave: boolean
    canReset: boolean
    onChange: (patch: Partial<SavedPasswordDto>) => void
    onReset: () => void
    onSave: () => Promise<void> | void
    onDelete: (id: string) => Promise<void> | void
}

export default function PasswordEditForm({
    draft,
    selectedId,
    canSave,
    canReset,
    onChange,
    onReset,
    onSave,
    onDelete,
}: PasswordEditFormProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [tagInput, setTagInput] = useState('')
    const [confirmAction, setConfirmAction] = useState<
        'save' | 'delete' | null
    >(null)
    const copiedResetTimeoutRef = useRef<number | null>(null)

    useEffect(() => {
        setIsPasswordVisible(false)
        setCopiedField(null)
        setTagInput('')
        if (copiedResetTimeoutRef.current) {
            window.clearTimeout(copiedResetTimeoutRef.current)
            copiedResetTimeoutRef.current = null
        }
    }, [draft.PasswordId])

    useEffect(() => {
        return () => {
            if (copiedResetTimeoutRef.current) {
                window.clearTimeout(copiedResetTimeoutRef.current)
            }
        }
    }, [])

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

    const tagsString = (draft.Tags ?? []).join(', ')

    function addTag(value: string) {
        const next = value.trim()
        if (!next) {
            return
        }

        const current = draft.Tags ?? []
        const exists = current.some(
            (tag) => tag.trim().toLowerCase() === next.toLowerCase(),
        )
        if (exists) {
            setTagInput('')
            return
        }

        onChange({ Tags: [...current, next] })
        setTagInput('')
    }

    function removeTag(tagToRemove: string) {
        onChange({
            Tags: (draft.Tags ?? []).filter((tag) => tag !== tagToRemove),
        })
    }

    function generateSafePassword(length = 20): string {
        const lower = 'abcdefghjkmnpqrstuvwxyz'
        const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ'
        const digits = '23456789'
        const symbols = '!@#$%^&*()-_=+[]{};:,.?'

        const pick = (charset: string): string => {
            const array = new Uint32Array(1)
            window.crypto.getRandomValues(array)
            return charset[array[0] % charset.length]
        }

        const required = [pick(lower), pick(upper), pick(digits), pick(symbols)]
        const all = lower + upper + digits + symbols

        const chars = [...required]
        while (chars.length < length) {
            chars.push(pick(all))
        }

        for (let i = chars.length - 1; i > 0; i--) {
            const array = new Uint32Array(1)
            window.crypto.getRandomValues(array)
            const j = array[0] % (i + 1)
            ;[chars[i], chars[j]] = [chars[j], chars[i]]
        }

        return chars.join('')
    }

    function onGeneratePassword() {
        const generated = generateSafePassword()
        onChange({ Password: generated })
        setIsPasswordVisible(true)
        toast.success('Random safe password generated.')
    }

    async function handleConfirmAction() {
        if (confirmAction === 'save') {
            await onSave()
            setConfirmAction(null)
            return
        }

        if (confirmAction === 'delete' && selectedId) {
            await onDelete(selectedId)
            setConfirmAction(null)
        }
    }

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                    <Input
                        id="name"
                        value={draft.Name}
                        onChange={(e) => onChange({ Name: e.target.value })}
                        placeholder="Example: Github"
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label="Copy name"
                        onClick={() =>
                            void copyValue(draft.Name, 'Name', 'name')
                        }
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
                        onChange={(e) => onChange({ Login: e.target.value })}
                        placeholder="username or email"
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label="Copy login"
                        onClick={() =>
                            void copyValue(draft.Login, 'Login', 'login')
                        }
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
                            onChange({ SecondLogin: e.target.value || null })
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
                <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onGeneratePassword}
                        className="h-8 px-2"
                    >
                        <RefreshCwIcon className="size-3.5" />
                        Generate
                    </Button>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        autoComplete="off"
                        value={draft.Password}
                        onChange={(e) => onChange({ Password: e.target.value })}
                        placeholder="password"
                        className="pr-16"
                    />
                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                        <button
                            type="button"
                            aria-label={
                                isPasswordVisible
                                    ? 'Hide password'
                                    : 'Show password'
                            }
                            onClick={() =>
                                setIsPasswordVisible((prev) => !prev)
                            }
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
                                void copyValue(
                                    draft.Password,
                                    'Password',
                                    'password',
                                )
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
                            onChange({ Url: e.target.value || null })
                        }
                        placeholder="https://..."
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label="Copy url"
                        onClick={() =>
                            void copyValue(draft.Url ?? '', 'Url', 'url')
                        }
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
                <div className="space-y-2">
                    {(draft.Tags ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {(draft.Tags ?? []).map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="gap-1 pr-1"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        aria-label={`Remove ${tag} tag`}
                                        onClick={() => removeTag(tag)}
                                        className="inline-flex size-4 items-center justify-center rounded-sm hover:bg-accent"
                                    >
                                        <XIcon className="size-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    ) : null}

                    <div className="relative">
                        <Input
                            id="tags"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ',') {
                                    e.preventDefault()
                                    addTag(tagInput)
                                    return
                                }

                                if (
                                    e.key === 'Backspace' &&
                                    !tagInput &&
                                    (draft.Tags ?? []).length
                                ) {
                                    const last =
                                        draft.Tags?.[draft.Tags.length - 1]
                                    if (last) {
                                        removeTag(last)
                                    }
                                }
                            }}
                            onBlur={() => addTag(tagInput)}
                            placeholder="Type a tag and press Enter"
                            className="pr-10"
                        />
                        <button
                            type="button"
                            aria-label="Copy tags"
                            onClick={() =>
                                void copyValue(tagsString, 'Tags', 'tags')
                            }
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
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <div className="relative">
                    <Textarea
                        id="notes"
                        value={draft.Notes ?? ''}
                        onChange={(e) =>
                            onChange({ Notes: e.target.value || null })
                        }
                        placeholder="Additional notes"
                        className="pr-10 bg-background!"
                    />
                    <button
                        type="button"
                        aria-label="Copy notes"
                        onClick={() =>
                            void copyValue(draft.Notes ?? '', 'Notes', 'notes')
                        }
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

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onReset}
                    disabled={!canReset}
                    className="w-full sm:w-auto"
                >
                    Reset
                </Button>

                <Button
                    type="button"
                    onClick={() => setConfirmAction('save')}
                    disabled={!canSave}
                    className="w-full sm:w-auto"
                >
                    Save
                </Button>

                {selectedId ? (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setConfirmAction('delete')}
                        className="w-full sm:w-auto"
                    >
                        Delete
                    </Button>
                ) : null}
            </div>

            <Dialog
                open={confirmAction !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmAction(null)
                    }
                }}
            >
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>
                            {confirmAction === 'save'
                                ? 'Confirm save changes'
                                : 'Confirm delete password'}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmAction === 'save'
                                ? 'This will apply your changes to this password entry.'
                                : 'This action cannot be undone. The password entry will be permanently deleted.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmAction(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant={
                                confirmAction === 'delete'
                                    ? 'destructive'
                                    : 'default'
                            }
                            onClick={() => void handleConfirmAction()}
                        >
                            {confirmAction === 'save'
                                ? 'Confirm save'
                                : 'Confirm delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
