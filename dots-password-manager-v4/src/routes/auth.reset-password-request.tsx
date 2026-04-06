import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'

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

export const Route = createFileRoute('/auth/reset-password-request')({
  component: ResetPasswordRequestPage,
})

type ResetResponse = {
  Message?: string
}

function ResetPasswordRequestPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = async (
    e,
  ) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email }),
      })

      const data = (await res.json()) as ResetResponse
      if (!res.ok) {
        setError(data.Message ?? 'Unable to process request.')
        return
      }

      setMessage(
        data.Message ??
          'Check your emails and click the link to continue, the request will be valid for the next 10 minutes',
      )
    } catch {
      setError('Unable to reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-10 pt-12">
      <Card>
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            We will send you a secure reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Account email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border bg-background/90"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert variant="success">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send reset email'}
            </Button>
          </form>

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
