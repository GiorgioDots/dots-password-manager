import { useForm } from '@tanstack/react-form'
import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import z from 'zod'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { mapFieldErrors } from '#/lib/shared/form/mapFieldErrors'
import {
    getErrorMessage,
    resetPasswordServerFn,
    validatePasswordResetRequestServerFn,
} from '#/lib/shared/server-functions/auth'
import { AuthMainContainer } from '#/components/auth/MainContainer'

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

    const [error, setError] = useState<string | null>(null)

    const defaultValues = {
        Password: '',
        ConfirmPassword: '',
    }

    function validatePassword(value: string) {
        if (!value) {
            return 'Password is required.'
        }

        if (value.length < 8) {
            return 'Password must have at least 8 characters.'
        }

        return undefined
    }

    function validateConfirmPassword(password: string, confirmPassword: string) {
        if (!confirmPassword) {
            return 'Please confirm your password.'
        }

        if (password !== confirmPassword) {
            return 'Passwords do not match.'
        }

        return undefined
    }

    const form = useForm({
        defaultValues,
        validators: {
            onChange: ({ value }) => {
                const passwordError = validatePassword(value.Password)
                const confirmPasswordError = validateConfirmPassword(
                    value.Password,
                    value.ConfirmPassword,
                )

                if (!passwordError && !confirmPasswordError) {
                    return undefined
                }

                return {
                    fields: {
                        Password: passwordError,
                        ConfirmPassword: confirmPasswordError,
                    },
                }
            },
        },
        onSubmit: async ({ value }) => {
            if (!requestId) {
                toast.error('Invalid reset link.')
                return
            }

            try {
                const data = await resetPasswordServerFn({
                    data: {
                        RequestId: requestId,
                        NewPassword: value.Password,
                    },
                })

                toast.success(data.Message)
                form.reset()
                await navigate({ to: '/auth/login', replace: true })
            } catch (submitError) {
                const backendMessage = getErrorMessage(submitError, 'Unable to reach the server.')
                toast.error(backendMessage)
                setError(backendMessage)

                if (backendMessage.includes('expired or not valid')) {
                    setIsRequestValid(false)
                }
            }
        },
    })

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

    return (
        <AuthMainContainer>
            <Card>
                <CardHeader>
                    <CardTitle>Choose new password</CardTitle>
                    <CardDescription>This link must still be valid to proceed.</CardDescription>
                </CardHeader>

                <CardContent>
                    {checkingRequest ? (
                        <p className="text-sm text-muted-foreground">Validating reset link...</p>
                    ) : isRequestValid ? (
                        <form
                            className="space-y-4"
                            noValidate
                            onSubmit={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                form.handleSubmit()
                            }}
                        >
                            <form.Subscribe
                                selector={(state) => ({
                                    isSubmitting: state.isSubmitting,
                                    isSubmitted: state.isSubmitted,
                                })}
                            >
                                {({ isSubmitting, isSubmitted }) => (
                                    <>
                                        <form.Field name="Password">
                                            {(field) => {
                                                const showError =
                                                    isSubmitted || field.state.meta.isTouched
                                                const fieldErrors = showError
                                                    ? mapFieldErrors(field.state.meta.errors)
                                                    : []

                                                return (
                                                    <Field
                                                        className="space-y-2 gap-0"
                                                        data-invalid={Boolean(fieldErrors.length)}
                                                        data-disabled={isSubmitting}
                                                    >
                                                        <FieldLabel
                                                            htmlFor="reset-password-new"
                                                            className="text-muted-foreground"
                                                        >
                                                            New password
                                                        </FieldLabel>
                                                        <Input
                                                            id="reset-password-new"
                                                            type="password"
                                                            value={field.state.value}
                                                            onChange={(e) =>
                                                                field.handleChange(e.target.value)
                                                            }
                                                            onBlur={field.handleBlur}
                                                            className="border-border bg-background/90"
                                                            disabled={isSubmitting}
                                                            aria-invalid={Boolean(
                                                                fieldErrors.length,
                                                            )}
                                                        />
                                                        <FieldError errors={fieldErrors} />
                                                    </Field>
                                                )
                                            }}
                                        </form.Field>

                                        <form.Field name="ConfirmPassword">
                                            {(field) => {
                                                const showError =
                                                    isSubmitted || field.state.meta.isTouched
                                                const fieldErrors = showError
                                                    ? mapFieldErrors(field.state.meta.errors)
                                                    : []

                                                return (
                                                    <Field
                                                        className="space-y-2 gap-0"
                                                        data-invalid={Boolean(fieldErrors.length)}
                                                        data-disabled={isSubmitting}
                                                    >
                                                        <FieldLabel
                                                            htmlFor="reset-password-confirm"
                                                            className="text-muted-foreground"
                                                        >
                                                            Confirm password
                                                        </FieldLabel>
                                                        <Input
                                                            id="reset-password-confirm"
                                                            type="password"
                                                            value={field.state.value}
                                                            onChange={(e) =>
                                                                field.handleChange(e.target.value)
                                                            }
                                                            onBlur={field.handleBlur}
                                                            className="border-border bg-background/90"
                                                            disabled={isSubmitting}
                                                            aria-invalid={Boolean(
                                                                fieldErrors.length,
                                                            )}
                                                        />
                                                        <FieldError errors={fieldErrors} />
                                                    </Field>
                                                )
                                            }}
                                        </form.Field>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full"
                                        >
                                            {isSubmitting ? 'Updating...' : 'Update password'}
                                        </Button>
                                    </>
                                )}
                            </form.Subscribe>
                        </form>
                    ) : (
                        <p className="text-sm text-destructive">
                            {error ?? 'This reset link is invalid or expired.'}
                        </p>
                    )}

                    <div className="mt-5 text-sm">
                        <Link to="/auth/login" className="text-primary hover:underline">
                            Go back
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthMainContainer>
    )
}
