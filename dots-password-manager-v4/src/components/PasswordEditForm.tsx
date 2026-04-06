import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { toast } from 'sonner'

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
import type { SavedPasswordDto } from '#/lib/passwords/contracts'

type PasswordEditFormProps = {
  draft: SavedPasswordDto
  selectedId: string | null
  canSave: boolean
  onChange: (patch: Partial<SavedPasswordDto>) => void
  onSave: () => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
}

export default function PasswordEditForm({
  draft,
  selectedId,
  canSave,
  onChange,
  onSave,
  onDelete,
}: PasswordEditFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'save' | 'delete' | null>(
    null,
  )
  const copiedResetTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setIsPasswordVisible(false)
    setCopiedField(null)
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
            onChange={(e) => onChange({ Login: e.target.value })}
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
            onChange={(e) => onChange({ SecondLogin: e.target.value || null })}
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
            onChange={(e) => onChange({ Password: e.target.value })}
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
            onChange={(e) => onChange({ Url: e.target.value || null })}
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
              onChange({
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
            onChange={(e) => onChange({ Notes: e.target.value || null })}
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

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
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
              variant={confirmAction === 'delete' ? 'destructive' : 'default'}
              onClick={() => void handleConfirmAction()}
            >
              {confirmAction === 'save' ? 'Confirm save' : 'Confirm delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
