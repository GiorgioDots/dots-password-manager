import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { notifyAuthStateChanged } from '#/lib/client/auth'
import type { LoginRequest } from '#/lib/shared/auth/contracts'
import { mapFieldErrors } from '#/lib/shared/form/mapFieldErrors'
import { getErrorMessage, loginServerFn } from '#/lib/shared/server-functions/auth'
import { AuthMainContainer } from '#/components/auth/MainContainer'

export const Route = createFileRoute('/auth/(only-no-auth)/login')({
    component: LoginPage,
})

function LoginPage() {
    const navigate = useNavigate()

    const defaultValues: LoginRequest = {
        Login: '',
        Password: '',
    }

    function validateLogin(value: string) {
        const normalized = value.trim()

        if (!normalized) {
            return 'Email or username is required.'
        }

        if (normalized.length < 3) {
            return 'Use at least 3 characters.'
        }

        return undefined
    }

    function validatePassword(value: string) {
        if (!value) {
            return 'Password is required.'
        }

        if (value.length < 8) {
            return 'Use at least 8 characters.'
        }

        return undefined
    }

    const form = useForm({
        defaultValues,
        validators: {
            onChange: ({ value }) => {
                const loginError = validateLogin(value.Login)
                const passwordError = validatePassword(value.Password)

                if (!loginError && !passwordError) {
                    return undefined
                }

                return {
                    fields: {
                        Login: loginError,
                        Password: passwordError,
                    },
                }
            },
        },
        onSubmit: async ({ value }) => {
            try {
                const data = await loginServerFn({
                    data: value,
                })

                if (!data.LoggedIn) {
                    toast.error('Invalid credentials.')
                    return
                }

                notifyAuthStateChanged()
                await navigate({ to: '/saved-passwords' })
            } catch (error) {
                toast.error(getErrorMessage(error, 'Unable to reach the server.'))
            }
        },
    })

    return (
        <AuthMainContainer>
            <Card>
                <CardHeader>
                    <CardTitle>Sign in</CardTitle>
                    <CardDescription>Access your encrypted vault.</CardDescription>
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
                                    <form.Field name="Login">
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
                                                        htmlFor="login-input"
                                                        className="text-muted-foreground"
                                                    >
                                                        Email or username
                                                    </FieldLabel>
                                                    <Input
                                                        id="login-input"
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
                                                        htmlFor="password-input"
                                                        className="text-muted-foreground"
                                                    >
                                                        Password
                                                    </FieldLabel>
                                                    <Input
                                                        id="password-input"
                                                        type="password"
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
                                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                                    </Button>
                                </>
                            )}
                        </form.Subscribe>
                    </form>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                        <Link to="/auth/register" className="text-primary hover:underline">
                            Create account
                        </Link>
                        <Link
                            to="/auth/reset-password-request"
                            className="text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthMainContainer>
    )
}
