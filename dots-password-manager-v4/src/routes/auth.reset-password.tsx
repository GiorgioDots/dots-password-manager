import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { Alert, AlertDescription } from '#/components/ui/alert'
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
  const search = Route.useSearch()
  const requestId = search.r ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = async (
    e,
  ) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!requestId) {
      setError('Invalid reset link.')
      return
    }

    if (password.length < 6) {
      setError('Password must have at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
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
        setError(data.Message ?? 'Unable to reset password.')
        return
      }

      setMessage(
        data.Message ?? 'Your password has been resetted, please login again',
      )
      setPassword('')
      setConfirmPassword('')
    } catch {
      setError('Unable to reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-10 pt-12">
      <Card className="island-shell rise-in mx-auto max-w-md rounded-3xl bg-card/70 shadow-xl">
        <CardHeader>
          <p className="island-kicker">Dots Password Manager</p>
          <CardTitle className="display-title text-4xl text-foreground">
            Choose new password
          </CardTitle>
          <CardDescription>
            This link must still be valid to proceed.
          </CardDescription>
        </CardHeader>

        <CardContent>
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
              <Label className="text-muted-foreground">Confirm password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-border bg-background/90"
                minLength={6}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 text-red-700">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert variant="success">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </form>

          <div className="mt-5 text-sm">
            <Link
              to="/auth/login"
              className="text-primary no-underline hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
