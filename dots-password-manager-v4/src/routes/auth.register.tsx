import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'

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
import { setTokens } from '#/lib/client-auth'

type RegisterResponse = {
  Token?: string
  RefreshToken?: string
  Message?: string
}

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = async (
    e,
  ) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Email: email,
          Username: username,
          Password: password,
        }),
      })

      const data = (await res.json()) as RegisterResponse
      if (!res.ok || !data.Token || !data.RefreshToken) {
        setError(data.Message ?? 'Registration failed.')
        return
      }

      setTokens(data.Token, data.RefreshToken)
      await navigate({ to: '/saved-passwords' })
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
            Create account
          </CardTitle>
          <CardDescription>Start protecting your credentials.</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border bg-background/90"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-border bg-background/90"
                minLength={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-5 text-sm">
            <Link
              to="/auth/login"
              className="text-primary no-underline hover:underline"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
