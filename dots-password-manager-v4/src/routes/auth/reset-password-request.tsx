import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { AuthMainContainer } from '#/components/auth/MainContainer'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { authClient } from '#/lib/client/auth-client'
import { mapFieldErrors } from '#/lib/shared/form/mapFieldErrors'
import { getErrorMessage } from '#/lib/shared/server-functions/auth'

export const Route = createFileRoute('/auth/reset-password-request')({
    component: ResetPasswordRequestPage,
})

function ResetPasswordRequestPage() {
    const { t } = useTranslation(['auth', 'validation', 'common'])
    const defaultValues = {
        Email: '',
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
            const { error } = await authClient.requestPasswordReset({
                email: value.Email.trim(),
                redirectTo: '/auth/reset-password',
            })

            if (error) {
                toast.error(getErrorMessage(error, t('common:server_unreachable')))
                return
            }

            toast.success(t('auth:reset_request_sent_message'))
        },
    })

    return (
        <AuthMainContainer>
            <Card>
                <CardHeader>
                    <CardTitle>{t('auth:reset_request_title')}</CardTitle>
                    <CardDescription>{t('auth:reset_request_description')}</CardDescription>
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
                                                        {t('auth:reset_request_email_label')}
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
                                        {isSubmitting
                                            ? t('auth:reset_request_submitting')
                                            : t('auth:reset_request_submit')}
                                    </Button>
                                </>
                            )}
                        </form.Subscribe>
                    </form>

                    <div className="mt-5 text-sm">
                        <Link to="/auth/login" className="text-primary hover:underline">
                            {t('common:go_back')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthMainContainer>
    )
}
