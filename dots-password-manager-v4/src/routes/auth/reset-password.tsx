import { useEffect, useState } from 'react'
import type { ComponentProps } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import z from 'zod'

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
    resetPasswordServerFn,
    validatePasswordResetRequestServerFn,
} from '#/lib/shared/server-functions/auth'

export const Route = createFileRoute('/auth/reset-password')({
    validateSearch: z.object({
        r: z.uuid().optional(),
    }),
    component: ResetPasswordPage,
})

function ResetPasswordPage() {
    const navigate = useNavigate()
    const search = Route.useSearch()
    const requestId = search.r ?? ''
    const [isRequestValid, setIsRequestValid] = useState(false)
    const [checkingRequest, setCheckingRequest] = useState(true)

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!requestId) {
            setError('This reset link is invalid or expired.')
            setIsRequestValid(false)
            setCheckingRequest(false)
            return
        }

        setCheckingRequest(true)

        validatePasswordResetRequestServerFn({
            data: { RequestId: requestId },
        })
            .then(() => {
                setError(null)
                setIsRequestValid(true)
            })
            .catch((validationError) => {
                setError(
                    getErrorMessage(
                        validationError,
                        'Unable to validate reset link. Please try again later.',
                    ),
                )
                setIsRequestValid(false)
            })
            .finally(() => {
                setCheckingRequest(false)
            })
    }, [requestId])

    const onSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = async (
        e,
    ) => {
        e.preventDefault()

        if (!requestId) {
            toast.error('Invalid reset link.')
            return
        }

        if (password.length < 6) {
            toast.error('Password must have at least 6 characters.')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.')
            return
        }

        setLoading(true)
        try {
            const data = await resetPasswordServerFn({
                data: {
                    RequestId: requestId,
                    NewPassword: password,
                },
            })

            toast.success(data.Message)
            setPassword('')
            setConfirmPassword('')
            await navigate({ to: '/auth/login', replace: true })
        } catch (submitError) {
            const backendMessage = getErrorMessage(
                submitError,
                'Unable to reach the server.',
            )
            toast.error(backendMessage)
            setError(backendMessage)
            if (backendMessage.includes('expired or not valid')) {
                setIsRequestValid(false)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-12">
            <Card>
                <CardHeader>
                    <CardTitle>Choose new password</CardTitle>
                    <CardDescription>
                        This link must still be valid to proceed.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {checkingRequest ? (
                        <p className="text-sm text-muted-foreground">
                            Validating reset link...
                        </p>
                    ) : isRequestValid ? (
                        <form className="space-y-4" onSubmit={onSubmit}>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    New password
                                </Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="border-border bg-background/90"
                                    minLength={6}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Confirm password
                                </Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    className="border-border bg-background/90"
                                    minLength={6}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? 'Updating...' : 'Update password'}
                            </Button>
                        </form>
                    ) : (
                        <p className="text-sm text-destructive">
                            {error ?? 'This reset link is invalid or expired.'}
                        </p>
                    )}

                    <div className="mt-5 text-sm">
                        <Link
                            to="/auth/login"
                            className="text-primary hover:underline"
                        >
                            Go back
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
