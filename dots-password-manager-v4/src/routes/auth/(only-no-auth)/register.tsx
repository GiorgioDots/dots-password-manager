import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AuthMainContainer } from '#/components/auth/MainContainer'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { notifyAuthStateChanged } from '#/lib/client/auth'
import { authClient } from '#/lib/client/auth-client'
import { mapFieldErrors } from '#/lib/shared/form/mapFieldErrors'
import { getErrorMessage } from '#/lib/shared/server-functions/auth'

export const Route = createFileRoute('/auth/(only-no-auth)/register')({
    component: RegisterPage,
})

function RegisterPage() {
    const navigate = useNavigate()
    const { t } = useTranslation(['auth', 'validation', 'common', 'vault'])

    const defaultValues = {
        Email: '',
        Username: '',
        Password: '',
    }

    function validateEmail(value: string) {
        const normalized = value.trim()

        if (!normalized) {
            return t('validation:email_required')
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
            return t('validation:email_invalid')
        }

        return undefined
    }

    function validateUsername(value: string) {
        const normalized = value.trim()

        if (!normalized) {
            return t('validation:username_required')
        }

        if (normalized.length < 3) {
            return t('validation:min_3_chars')
        }

        return undefined
    }

    function validatePassword(value: string) {
        if (!value) {
            return t('validation:password_required')
        }

        if (value.length < 8) {
            return t('validation:min_8_chars')
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
            const { error } = await authClient.signUp.email({
                email: value.Email.trim(),
                // BA `name` stores the display username
                name: value.Username.trim(),
                password: value.Password,
                // username plugin: normalizes to lowercase, sets displayUsername automatically
                username: value.Username.trim(),
            })

            if (error) {
                toast.error(getErrorMessage(error, t('common:server_unreachable')))
                return
            }

            notifyAuthStateChanged()
            await navigate({ to: '/saved-passwords' })
        },
    })

    return (
        <AuthMainContainer>
            <Card>
                <CardHeader>
                    <CardTitle>{t('auth:register_title')}</CardTitle>
                    <CardDescription>{t('auth:register_description')}</CardDescription>
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
                                                        {t('auth:register_email_label')}
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
                                                        {t('auth:register_username_label')}
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
                                                        {t('vault:field_password')}
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
                                        {isSubmitting
                                            ? t('auth:register_submitting')
                                            : t('auth:register_submit')}
                                    </Button>
                                </>
                            )}
                        </form.Subscribe>
                    </form>

                    <div className="mt-5 text-sm">
                        <Link to="/auth/login" className="text-primary hover:underline">
                            {t('auth:register_login_link')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthMainContainer>
    )
}
