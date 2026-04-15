import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DownloadIcon, UploadIcon } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { exportPasswords, importPasswords } from '#/lib/client/passwords'
import type { ImportExportDto } from '#/lib/shared/passwords/contracts'

export const Route = createFileRoute('/(protected)/settings/')({
    component: SettingsPage,
})

function SettingsPage() {
    const importInputRef = useRef<HTMLInputElement | null>(null)
    const queryClient = useQueryClient()
    const { t } = useTranslation('settings')

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

            toast.success(t('toast_exported'))
        } catch {
            toast.error(t('toast_export_failed'))
        }
    }

    async function onImportFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) {
            return
        }

        try {
            const text = await file.text()
            const payload = JSON.parse(text) as ImportExportDto
            await importPasswords(payload)
            await queryClient.invalidateQueries()
            toast.success(t('toast_imported'))
        } catch {
            toast.error(t('toast_import_failed'))
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
                    <CardTitle>{t('import_export_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {t('import_export_description')}
                    </p>

                    <input
                        ref={importInputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={(e) => {
                            onImportFileChange(e).catch(() => {})
                        }}
                        className="hidden"
                    />

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onExport().catch(() => {})
                            }}
                        >
                            <DownloadIcon className="size-4" />
                            {t('export_button')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => importInputRef.current?.click()}
                        >
                            <UploadIcon className="size-4" />
                            {t('import_button')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
