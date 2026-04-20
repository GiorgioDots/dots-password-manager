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
import type { LoginRequest } from '#/lib/shared/auth/contracts'
import { mapFieldErrors } from '#/lib/shared/form/mapFieldErrors'
import { getErrorMessage, loginServerFn } from '#/lib/shared/server-functions/auth'

export const Route = createFileRoute('/auth/(only-no-auth)/login')({
    component: LoginPage,
})

function LoginPage() {
    const navigate = useNavigate()
    const { t } = useTranslation(['auth', 'validation', 'common', 'vault'])

    const defaultValues: LoginRequest = {
        Login: '',
        Password: '',
    }

    function validateLogin(value: string) {
        const normalized = value.trim()

        if (!normalized) {
            return t('validation:login_required')
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
                    toast.error(t('auth:toast_invalid_credentials'))
                    return
                }

                notifyAuthStateChanged()
                await navigate({ to: '/saved-passwords' })
            } catch (error) {
                toast.error(getErrorMessage(error, t('common:server_unreachable')))
            }
        },
    })

    return (
        <AuthMainContainer>
            <Card>
                <CardHeader>
                    <CardTitle>{t('auth:login_title')}</CardTitle>
                    <CardDescription>{t('auth:login_description')}</CardDescription>
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
                                                        {t('auth:login_login_label')}
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
                                                        {t('vault:field_password')}
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
                                        {isSubmitting
                                            ? t('auth:login_submitting')
                                            : t('auth:login_submit')}
                                    </Button>
                                </>
                            )}
                        </form.Subscribe>
                    </form>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                        <Link to="/auth/register" className="text-primary hover:underline">
                            {t('auth:login_register_link')}
                        </Link>
                        <Link
                            to="/auth/reset-password-request"
                            className="text-primary hover:underline"
                        >
                            {t('auth:login_forgot_password_link')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthMainContainer>
    )
}
