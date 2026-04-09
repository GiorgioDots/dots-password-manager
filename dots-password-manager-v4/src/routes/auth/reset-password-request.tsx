import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
    getErrorMessage,
    requestPasswordResetServerFn,
} from '#/lib/shared/server-functions/auth'

export const Route = createFileRoute('/auth/reset-password-request')({
    component: ResetPasswordRequestPage,
})

function ResetPasswordRequestPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = async (
        e,
    ) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = await requestPasswordResetServerFn({
                data: { Email: email },
            })

            toast.success(data.Message)
        } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to reach the server.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-12">
            <Card>
                <CardHeader>
                    <CardTitle>Reset password</CardTitle>
                    <CardDescription>
                        We will send you a secure reset link.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form className="space-y-4" onSubmit={onSubmit}>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">
                                Account email
                            </Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-border bg-background/90"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Sending...' : 'Send reset email'}
                        </Button>
                    </form>

                    <div className="mt-5 text-sm">
                        <Link
                            to="/auth/login"
                            className="text-primary hover:underline"
                        >
                            Back to sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
