import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import z from 'zod'

import { AuthMainContainer } from '#/components/auth/MainContainer'
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

export const Route = createFileRoute('/auth/reset-password')({
    validateSearch: z.object({
        r: z.uuid().optional(),
    }),
    component: ResetPasswordPage,
})

function ResetPasswordPage() {
    const navigate = useNavigate()
    const { t } = useTranslation(['auth', 'validation', 'common'])
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
            return t('validation:password_required')
        }

        if (value.length < 8) {
            return t('validation:password_min_length')
        }

        return undefined
    }

    function validateConfirmPassword(password: string, confirmPassword: string) {
        if (!confirmPassword) {
            return t('validation:confirm_password_required')
        }

        if (password !== confirmPassword) {
            return t('validation:passwords_mismatch')
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
                toast.error(t('auth:toast_reset_link_invalid'))
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
                const backendMessage = getErrorMessage(submitError, t('common:server_unreachable'))
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
            setError(t('auth:reset_link_invalid'))
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
                setError(getErrorMessage(validationError, t('auth:toast_reset_validate_failed')))
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
                    <CardTitle>{t('auth:reset_title')}</CardTitle>
                    <CardDescription>{t('auth:reset_description')}</CardDescription>
                </CardHeader>

                <CardContent>
                    {checkingRequest ? (
                        <p className="text-sm text-muted-foreground">
                            {t('auth:reset_validating')}
                        </p>
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
                                                            {t('auth:reset_new_password_label')}
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
                                                            {t('auth:reset_confirm_password_label')}
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
                                            {isSubmitting
                                                ? t('auth:reset_submitting')
                                                : t('auth:reset_submit')}
                                        </Button>
                                    </>
                                )}
                            </form.Subscribe>
                        </form>
                    ) : (
                        <p className="text-sm text-destructive">
                            {error ?? t('auth:reset_link_invalid')}
                        </p>
                    )}

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
