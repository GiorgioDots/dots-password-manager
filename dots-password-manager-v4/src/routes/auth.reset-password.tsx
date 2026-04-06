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

type ResetResponse = {
  Message?: string
}

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

    fetch(`/api/auth/reset-password?r=${encodeURIComponent(requestId)}`)
      .then(async (res) => {
        const data = (await res.json()) as ResetResponse
        if (!res.ok) {
          setError(data.Message ?? 'This reset link is invalid or expired.')
          setIsRequestValid(false)
          return
        }

        setError(null)
        setIsRequestValid(true)
      })
      .catch(() => {
        setError('Unable to validate reset link. Please try again later.')
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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ RequestId: requestId, NewPassword: password }),
      })

      const data = (await res.json()) as ResetResponse
      if (!res.ok) {
        const backendMessage = data.Message ?? 'Unable to reset password.'
        toast.error(backendMessage)
        setError(backendMessage)
        if (backendMessage.includes('expired or not valid')) {
          setIsRequestValid(false)
        }
        return
      }

      toast.success(
        data.Message ?? 'Your password has been resetted, please login again',
      )
      setPassword('')
      setConfirmPassword('')
      await navigate({ to: '/auth/login', replace: true })
    } catch {
      toast.error('Unable to reach the server.')
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
                <Label className="text-muted-foreground">New password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-border bg-background/90"
                  minLength={6}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-destructive">
              {error ?? 'This reset link is invalid or expired.'}
            </p>
          )}

          <div className="mt-5 text-sm">
            <Link to="/auth/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
