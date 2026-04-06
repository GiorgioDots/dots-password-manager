import { useRef } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { DownloadIcon, UploadIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { isLoggedIn } from '#/lib/client-auth'
import { exportPasswords, importPasswords } from '#/lib/passwords/client'
import type { ImportExportDto } from '#/lib/passwords/contracts'

export const Route = createFileRoute('/settings')({
  beforeLoad: () => {
    if (typeof window === 'undefined') {
      return
    }

    if (!isLoggedIn()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: SettingsPage,
})

function SettingsPage() {
  const importInputRef = useRef<HTMLInputElement | null>(null)

  async function onExport() {
    try {
      const data = await exportPasswords()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dots-passwords-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      toast.success('Passwords exported.')
    } catch {
      toast.error('Unable to export passwords.')
    }
  }

  async function onImportFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const payload = JSON.parse(text) as ImportExportDto
      await importPasswords(payload)
      toast.success('Passwords imported.')
    } catch {
      toast.error('Unable to import passwords. Check file format.')
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = ''
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 sm:pt-10">
      <Card>
        <CardHeader>
          <CardTitle>Import / Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your vault as JSON for backup, or import a compatible JSON
            file to restore or migrate passwords.
          </p>

          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(e) => void onImportFileChange(e)}
            className="hidden"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => void onExport()}
            >
              <DownloadIcon className="size-4" />
              Export passwords
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => importInputRef.current?.click()}
            >
              <UploadIcon className="size-4" />
              Import passwords
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
