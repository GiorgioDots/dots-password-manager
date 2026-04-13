import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { AuthMainContainer } from '#/components/auth/MainContainer'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { notifyAuthStateChanged } from '#/lib/client/auth'
import type { RegisterRequest } from '#/lib/shared/auth/contracts'
import { mapFieldErrors } from '#/lib/shared/form/mapFieldErrors'
import { getErrorMessage, registerServerFn } from '#/lib/shared/server-functions/auth'

export const Route = createFileRoute('/auth/(only-no-auth)/register')({
    component: RegisterPage,
})

function RegisterPage() {
    const navigate = useNavigate()

    const defaultValues: RegisterRequest = {
        Email: '',
        Username: '',
        Password: '',
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

    function validateUsername(value: string) {
        const normalized = value.trim()

        if (!normalized) {
            return 'Username is required.'
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
                const emailError = validateEmail(value.Email)
                const usernameError = validateUsername(value.Username)
                const passwordError = validatePassword(value.Password)

                if (!emailError && !usernameError && !passwordError) {
                    return undefined
                }

                return {
                    fields: {
                        Email: emailError,
                        Username: usernameError,
                        Password: passwordError,
                    },
                }
            },
        },
        onSubmit: async ({ value }) => {
            try {
                const data = await registerServerFn({
                    data: value,
                })

                if (!data.LoggedIn) {
                    toast.error('Registration failed.')
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
                    <CardTitle>Create account</CardTitle>
                    <CardDescription>Start protecting your credentials.</CardDescription>
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
                                                        htmlFor="register-email"
                                                        className="text-muted-foreground"
                                                    >
                                                        Email
                                                    </FieldLabel>
                                                    <Input
                                                        id="register-email"
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

                                    <form.Field name="Username">
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
                                                        htmlFor="register-username"
                                                        className="text-muted-foreground"
                                                    >
                                                        Username
                                                    </FieldLabel>
                                                    <Input
                                                        id="register-username"
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
                                                        htmlFor="register-password"
                                                        className="text-muted-foreground"
                                                    >
                                                        Password
                                                    </FieldLabel>
                                                    <Input
                                                        id="register-password"
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
                                        {isSubmitting ? 'Creating account...' : 'Create account'}
                                    </Button>
                                </>
                            )}
                        </form.Subscribe>
                    </form>

                    <div className="mt-5 text-sm">
                        <Link to="/auth/login" className="text-primary hover:underline">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthMainContainer>
    )
}
