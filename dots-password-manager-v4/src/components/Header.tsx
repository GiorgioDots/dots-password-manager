import { useEffect, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { isLoggedIn } from '#/lib/client-auth'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const location = useLocation()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(isLoggedIn())
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 px-4 backdrop-blur-lg">
      <nav className="page-wrap py-2.5 sm:py-3">
        <div className="flex items-center gap-2">
          <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
            <Link
              to="/saved-passwords"
              className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-card/80 px-2.5 py-1.5 text-foreground no-underline shadow-sm sm:px-3"
            >
              <img
                src="/dpm-logo.png"
                alt="Dots Password Manager logo"
                className="h-8 w-8 rounded-md border border-border/70 bg-background/60 object-cover"
              />
              <span className="leading-tight">
                <span className="block text-sm font-semibold">
                  Dots Password Manager
                </span>
                <span className="block text-xs text-muted-foreground">
                  Secure vault
                </span>
              </span>
            </Link>
          </h2>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-2 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:flex-nowrap sm:pb-0">
          {loggedIn ? (
            <Link
              to="/saved-passwords"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Vault
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="nav-link"
                activeProps={{ className: 'nav-link is-active' }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
