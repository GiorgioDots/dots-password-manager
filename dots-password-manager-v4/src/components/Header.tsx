import { useEffect, useState } from 'react'
import { Logout03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { clearTokens, isLoggedIn } from '#/lib/client-auth'
import ThemeToggle from './ThemeToggle'

export default function Header() {
    const location = useLocation()
    const navigate = useNavigate()
    const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined)
    const navLinkClass =
        'text-sm text-muted-foreground transition-colors hover:text-foreground'

    useEffect(() => {
        setLoggedIn(isLoggedIn())
    }, [location.pathname])

    async function onLogout() {
        clearTokens()
        setLoggedIn(false)
        await navigate({ to: '/auth/login' })
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background px-4">
            <nav className="mx-auto w-full max-w-5xl py-2.5 sm:py-3">
                <div className="flex items-center gap-2">
                    <h2 className="m-0 min-w-0 text-base font-semibold tracking-tight sm:flex-none">
                        <Link
                            to="/saved-passwords"
                            className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-border bg-card/80 px-2 py-1.5 text-foreground no-underline shadow-sm sm:px-3"
                        >
                            <img
                                src="/dpm-logo.png"
                                alt="Dots Password Manager logo"
                                className="h-7 w-7 rounded-md border border-border/70 bg-background/60 object-cover sm:h-8 sm:w-8"
                            />
                            <span className="min-w-0 leading-tight">
                                <span className="hidden truncate text-sm font-semibold sm:block">
                                    Dots Password Manager
                                </span>
                                <span className="hidden text-xs text-muted-foreground sm:block">
                                    Secure vault
                                </span>
                            </span>
                        </Link>
                    </h2>

                    <div className="ml-auto flex items-center gap-1.5 sm:gap-2 max-[420px]:w-full max-[420px]:justify-end">
                        {loggedIn && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onLogout}
                                className="inline-flex h-8 items-center gap-1.5 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                            >
                                <HugeiconsIcon
                                    icon={Logout03Icon}
                                    size={14}
                                    strokeWidth={1.9}
                                />
                                Logout
                            </Button>
                        )}
                        <ThemeToggle />
                    </div>
                </div>

                <div className="mt-2 px-2 flex w-full flex-wrap items-center gap-x-3 gap-y-1 pb-1 text-xs font-semibold sm:flex-nowrap sm:gap-x-4 sm:pb-0 sm:text-sm">
                    {loggedIn == true ? (
                        <>
                            <Link
                                to="/saved-passwords"
                                className={navLinkClass}
                                activeProps={{ className: 'text-primary' }}
                            >
                                Vault
                            </Link>
                            <Link
                                to="/settings"
                                className={navLinkClass}
                                activeProps={{ className: 'text-primary' }}
                            >
                                Settings
                            </Link>
                        </>
                    ) : loggedIn == false ? (
                        <>
                            <Link
                                to="/auth/login"
                                className={navLinkClass}
                                activeProps={{ className: 'text-primary' }}
                            >
                                Login
                            </Link>
                            <Link
                                to="/auth/register"
                                className={navLinkClass}
                                activeProps={{ className: 'text-primary' }}
                            >
                                Register
                            </Link>
                        </>
                    ) : null}
                </div>
            </nav>
        </header>
    )
}
