import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
import { isLoggedIn, setTokens } from '#/lib/client/auth'
import {
    getErrorMessage,
    registerServerFn,
} from '#/lib/shared/server-functions/auth'

export const Route = createFileRoute('/auth/(only-no-auth)/register')({
    component: RegisterPage,
})

function RegisterPage() {
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoggedIn()) {
            navigate({ to: '/saved-passwords', replace: true }).catch(() => {})
        }
    }, [navigate])

    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmit: NonNullable<ComponentProps<'form'>['onSubmit']> = async (
        e,
    ) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = await registerServerFn({
                data: {
                    Email: email,
                    Username: username,
                    Password: password,
                },
            })

            if (!data.Token || !data.RefreshToken) {
                toast.error('Registration failed.')
                return
            }

            setTokens(data.Token, data.RefreshToken)
            await navigate({ to: '/saved-passwords' })
        } catch (error) {
            toast.error(getErrorMessage(error, 'Unable to reach the server.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-12">
            <Card>
                <CardHeader>
                    <CardTitle>Create account</CardTitle>
                    <CardDescription>
                        Start protecting your credentials.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form className="space-y-4" onSubmit={onSubmit}>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">
                                Email
                            </Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border-border bg-background/90"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground">
                                Username
                            </Label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="border-border bg-background/90"
                                minLength={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground">
                                Password
                            </Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-border bg-background/90"
                                minLength={6}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </Button>
                    </form>

                    <div className="mt-5 text-sm">
                        <Link
                            to="/auth/login"
                            className="text-primary hover:underline"
                        >
                            Already have an account? Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
