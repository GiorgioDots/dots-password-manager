import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import type { ResetPasswordRequestRequest } from '#/lib/shared/auth/contracts'
import { mapFieldErrors } from '#/lib/shared/form/mapFieldErrors'
import { getErrorMessage, requestPasswordResetServerFn } from '#/lib/shared/server-functions/auth'
import { AuthMainContainer } from '#/components/auth/MainContainer'

export const Route = createFileRoute('/auth/reset-password-request')({
    component: ResetPasswordRequestPage,
})

function ResetPasswordRequestPage() {
    const defaultValues: ResetPasswordRequestRequest = {
        Email: '',
    }

    function validateEmail(value: string) {
        const normalized = value.trim()

        if (!normalized) {
            return 'Email is required.'
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
            return 'Enter a valid email address.'
        }

        return undefined
    }

    const form = useForm({
        defaultValues,
        validators: {
            onChange: ({ value }) => {
                const emailError = validateEmail(value.Email)

                if (!emailError) {
                    return undefined
                }

                return {
                    fields: {
                        Email: emailError,
                    },
                }
            },
        },
        onSubmit: async ({ value }) => {
            try {
                const data = await requestPasswordResetServerFn({
                    data: value,
                })

                toast.success(data.Message)
            } catch (error) {
                toast.error(getErrorMessage(error, 'Unable to reach the server.'))
            }
        },
    })

    return (
        <AuthMainContainer>
            <Card>
                <CardHeader>
                    <CardTitle>Reset password</CardTitle>
                    <CardDescription>We will send you a secure reset link.</CardDescription>
                </CardHeader>

                <CardContent>
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
                                    <form.Field name="Email">
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
                                                        htmlFor="reset-request-email"
                                                        className="text-muted-foreground"
                                                    >
                                                        Account email
                                                    </FieldLabel>
                                                    <Input
                                                        id="reset-request-email"
                                                        type="email"
                                                        value={field.state.value}
                                                        onChange={(e) =>
                                                            field.handleChange(e.target.value)
                                                        }
                                                        onBlur={field.handleBlur}
                                                        className="border-border bg-background/90"
                                                        disabled={isSubmitting}
                                                        aria-invalid={Boolean(fieldErrors.length)}
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
                                        {isSubmitting ? 'Sending...' : 'Send reset email'}
                                    </Button>
                                </>
                            )}
                        </form.Subscribe>
                    </form>

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
