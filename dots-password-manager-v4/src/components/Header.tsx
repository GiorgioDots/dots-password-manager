import { Logout03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { useClientAuth } from '#/lib/client/auth-context'
import ThemeToggle from './ThemeToggle'

const navLinkClass =
    'relative rounded-lg px-2 py-1 text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-px hover:bg-muted/60 hover:text-foreground sm:px-2.5 after:absolute after:-bottom-1 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-primary/70 after:opacity-0 after:transition-all after:duration-300 after:ease-out after:content-[""]'
const navLinkActiveClass =
    'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25),0_0_24px_hsl(var(--primary)/0.12)] after:w-8 after:opacity-100'

export default function Header() {
    const navigate = useNavigate()
    const { loggedIn, logout } = useClientAuth()

    async function onLogout() {
        logout()
        await navigate({ to: '/auth/login' })
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background px-4">
            <nav className="mx-auto w-full max-w-5xl py-2.5 ">
                <div className="flex items-center gap-2 sm:gap-4">
                    <h2 className="shrink-0 m-0 min-w-0 text-base font-semibold tracking-tight sm:flex-none">
                        <Link
                            disabled={!loggedIn}
                            to="/saved-passwords"
                            className="inline-flex min-w-0 max-w-full items-center gap-0 sm:gap-2 rounded-xl border border-border bg-card/80 px-2 py-1.5 text-foreground no-underline shadow-sm sm:px-3"
                        >
                            <img
                                src="/dpm-logo.webp"
                                alt="Dots Password Manager logo"
                                className="h-9 w-9 rounded-md border border-border/70 bg-background/60 object-cover "
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

                    <div className="grow flex items-center justify-center sm:justify-start gap-3 text-xs font-semibold sm:flex-nowrap sm:gap-4 sm:text-sm">
                        {loggedIn == true ? (
                            <LoggedInLinks />
                        ) : loggedIn == false ? (
                            <LoggedOutLinks />
                        ) : null}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <ThemeToggle />
                        {loggedIn && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onLogout}
                                className="inline-flex h-8 items-center gap-1.5 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                            >
                                <HugeiconsIcon icon={Logout03Icon} size={14} strokeWidth={1.9} />
                                Logout
                            </Button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}

function LoggedInLinks() {
    return (
        <>
            <Link
                to="/saved-passwords"
                className={navLinkClass}
                activeProps={{
                    className: navLinkActiveClass,
                }}
            >
                Vault
            </Link>
            <Link
                to="/settings"
                className={navLinkClass}
                activeProps={{
                    className: navLinkActiveClass,
                }}
            >
                Settings
            </Link>
        </>
    )
}

function LoggedOutLinks() {
    return (
        <>
            <Link
                to="/auth/login"
                className={navLinkClass}
                activeProps={{
                    className: navLinkActiveClass,
                }}
            >
                Login
            </Link>
            <Link
                to="/auth/register"
                className={navLinkClass}
                activeProps={{
                    className: navLinkActiveClass,
                }}
            >
                Register
            </Link>
        </>
    )
}
