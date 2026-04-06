import { useEffect, useState } from 'react'
import type { ComponentProps } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { clearTokens, isLoggedIn } from '#/lib/client-auth'
import {
  createPassword,
  deletePassword,
  getPasswords,
} from '#/lib/passwords/client'
import type { SavedPasswordDto } from '#/lib/passwords/contracts'

export const Route = createFileRoute('/saved-passwords')({
  beforeLoad: () => {
    if (!isLoggedIn()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: SavedPasswordsPage,
})

function SavedPasswordsPage() {
  const navigate = useNavigate()

  const [passwords, setPasswords] = useState<SavedPasswordDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  async function loadPasswords() {
    setLoading(true)
    setError(null)
    try {
      const items = await getPasswords()
      setPasswords(items)
    } catch {
      setError('Unable to load passwords.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPasswords()
  }, [])

  const onCreate: NonNullable<ComponentProps<'form'>['onSubmit']> = async (
    e,
  ) => {
    e.preventDefault()
    setError(null)

    try {
      const created = await createPassword({
        Name: name,
        Login: login,
        Password: password,
        Notes: '',
        Url: '',
        Tags: [],
        SecondLogin: null,
        IsFavourite: false,
      })
      setPasswords((prev) => [created, ...prev])
      setName('')
      setLogin('')
      setPassword('')
    } catch {
      setError('Unable to create password.')
    }
  }

  async function onDelete(id: string | undefined) {
    if (!id) return

    try {
      await deletePassword(id)
      setPasswords((prev) => prev.filter((p) => p.PasswordId !== id))
    } catch {
      setError('Unable to delete password.')
    }
  }

  async function onLogout() {
    clearTokens()
    await navigate({ to: '/auth/login' })
  }

  return (
    <main className="page-wrap px-4 pb-10 pt-10">
      <Card className="island-shell rise-in rounded-3xl bg-card/70 shadow-xl">
        <CardHeader className="pb-4">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="island-kicker mb-1">Vault</p>
              <CardTitle className="display-title text-4xl text-foreground">
                Saved passwords
              </CardTitle>
            </div>
            <Button
              type="button"
              onClick={onLogout}
              variant="outline"
              className="border-border bg-card/70 text-foreground"
            >
              Logout
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={onCreate}
            className="mb-6 grid gap-3 rounded-2xl border border-border bg-card/60 p-4 sm:grid-cols-4"
          >
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-border bg-background"
              required
            />
            <Input
              placeholder="Login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="border-border bg-background"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-border bg-background"
              required
            />
            <Button type="submit" className="w-full sm:w-auto">
              Add
            </Button>
          </form>

          {error && (
            <Alert
              variant="destructive"
              className="mb-4 bg-red-50 text-red-700"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : passwords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No passwords yet.</p>
          ) : (
            <ul className="space-y-2">
              {passwords.map((item) => (
                <li
                  key={item.PasswordId}
                  className="flex items-center justify-between rounded-xl border border-border bg-card/70 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-foreground">{item.Name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.Login}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => void onDelete(item.PasswordId)}
                    variant="destructive"
                    size="sm"
                    className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
