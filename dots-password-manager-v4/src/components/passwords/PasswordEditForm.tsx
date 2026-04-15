import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, RefreshCwIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
    const [confirmAction, setConfirmAction] = useState<'save' | 'delete' | null>(null)
    const copiedResetTimeoutRef = useRef<number | null>(null)
    const { t } = useTranslation(['vault', 'common'])

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
            toast.success(t('toast_field_copied', { label }))
        } catch {
            toast.error(t('toast_copy_failed', { label: label.toLowerCase() }))
        }
    }

    const tagsString = (draft.Tags ?? []).join(', ')

    function addTag(value: string) {
        const next = value.trim()
        if (!next) {
            return
        }

        const current = draft.Tags ?? []
        const exists = current.some((tag) => tag.trim().toLowerCase() === next.toLowerCase())
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
        toast.success(t('toast_password_generated'))
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
                <Label htmlFor="name">{t('field_name')}</Label>
                <div className="relative">
                    <Input
                        id="name"
                        value={draft.Name}
                        onChange={(e) => onChange({ Name: e.target.value })}
                        placeholder={t('field_name_placeholder')}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label={t('copy_name_aria')}
                        onClick={() => {
                            copyValue(draft.Name, t('field_name'), 'name').catch(() => {})
                        }}
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
                <Label htmlFor="login">{t('field_login')}</Label>
                <div className="relative">
                    <Input
                        id="login"
                        value={draft.Login}
                        onChange={(e) => onChange({ Login: e.target.value })}
                        placeholder={t('field_login_placeholder')}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label={t('copy_login_aria')}
                        onClick={() => {
                            copyValue(draft.Login, t('field_login'), 'login').catch(() => {})
                        }}
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
                <Label htmlFor="second-login">{t('field_second_login')}</Label>
                <div className="relative">
                    <Input
                        id="second-login"
                        value={draft.SecondLogin ?? ''}
                        onChange={(e) => onChange({ SecondLogin: e.target.value || null })}
                        placeholder={t('field_optional_placeholder')}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label={t('copy_second_login_aria')}
                        onClick={() => {
                            copyValue(
                                draft.SecondLogin ?? '',
                                t('field_second_login'),
                                'second-login',
                            ).catch(() => {})
                        }}
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
                    <Label htmlFor="password">{t('field_password')}</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onGeneratePassword}
                        className="h-8 px-2"
                    >
                        <RefreshCwIcon className="size-3.5" />
                        {t('generate_button')}
                    </Button>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        autoComplete="off"
                        value={draft.Password}
                        onChange={(e) => onChange({ Password: e.target.value })}
                        placeholder={t('field_password_placeholder')}
                        className="pr-16"
                    />
                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                        <button
                            type="button"
                            aria-label={
                                isPasswordVisible
                                    ? t('hide_password_aria')
                                    : t('show_password_aria')
                            }
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
                            aria-label={t('copy_password_aria')}
                            onClick={() => {
                                copyValue(draft.Password, t('field_password'), 'password').catch(
                                    () => {},
                                )
                            }}
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
                <Label htmlFor="url">{t('field_url')}</Label>
                <div className="relative">
                    <Input
                        id="url"
                        value={draft.Url ?? ''}
                        onChange={(e) => onChange({ Url: e.target.value || null })}
                        placeholder={t('field_url_placeholder')}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label={t('copy_url_aria')}
                        onClick={() => {
                            copyValue(draft.Url ?? '', t('field_url'), 'url').catch(() => {})
                        }}
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
                <Label htmlFor="tags">{t('field_tags')}</Label>
                <div className="space-y-2">
                    {(draft.Tags ?? []).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {(draft.Tags ?? []).map((tag) => (
                                <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                                    {tag}
                                    <button
                                        type="button"
                                        aria-label={t('remove_tag_aria', { tag })}
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
                                    const last = draft.Tags?.[draft.Tags.length - 1]
                                    if (last) {
                                        removeTag(last)
                                    }
                                }
                            }}
                            onBlur={() => addTag(tagInput)}
                            placeholder={t('field_tags_placeholder')}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            aria-label={t('copy_tags_aria')}
                            onClick={() => {
                                copyValue(tagsString, t('field_tags'), 'tags').catch(() => {})
                            }}
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
                <Label htmlFor="notes">{t('field_notes')}</Label>
                <div className="relative">
                    <Textarea
                        id="notes"
                        value={draft.Notes ?? ''}
                        onChange={(e) => onChange({ Notes: e.target.value || null })}
                        placeholder={t('field_notes_placeholder')}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label={t('copy_notes_aria')}
                        onClick={() => {
                            copyValue(draft.Notes ?? '', t('field_notes'), 'notes').catch(() => {})
                        }}
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
                    {t('common:reset')}
                </Button>

                <Button
                    type="button"
                    onClick={() => setConfirmAction('save')}
                    disabled={!canSave}
                    className="w-full sm:w-auto"
                >
                    {t('common:save')}
                </Button>

                {selectedId ? (
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setConfirmAction('delete')}
                        className="w-full sm:w-auto"
                    >
                        {t('common:delete')}
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
                                ? t('confirm_save_title')
                                : t('confirm_delete_title')}
                        </DialogTitle>
                        <DialogDescription>
                            {confirmAction === 'save'
                                ? t('confirm_save_description')
                                : t('confirm_delete_description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConfirmAction(null)}
                        >
                            {t('common:cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant={confirmAction === 'delete' ? 'destructive' : 'default'}
                            onClick={() => {
                                handleConfirmAction().catch(() => {})
                            }}
                        >
                            {confirmAction === 'save'
                                ? t('confirm_save_button')
                                : t('confirm_delete_button')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
