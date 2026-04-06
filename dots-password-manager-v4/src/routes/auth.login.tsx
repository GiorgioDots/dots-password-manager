import { useEffect, useState } from 'react'
import type { ComponentProps } from 'react'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

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
import { isLoggedIn, setTokens } from '#/lib/client-auth'

type LoginResponse = {
  Token?: string
  RefreshToken?: string
  Message?: string
}

export const Route = createFileRoute('/auth/login')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && isLoggedIn()) {
      throw redirect({ to: '/saved-passwords' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn()) {
      navigate({ to: '/saved-passwords', replace: true }).catch(() => {})
    }
  }, [navigate])

  const [login, setLogin] = useState('')
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Login: login, Password: password }),
      })

      const data = (await res.json()) as LoginResponse
      if (!res.ok || !data.Token || !data.RefreshToken) {
        setError(data.Message ?? 'Invalid credentials.')
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
    <main className="mx-auto w-full max-w-md px-4 pb-10 pt-12">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your encrypted vault.</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email or username</Label>
              <Input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="border-border bg-background/90"
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
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
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
    </main>
  )
}
