import {
    ComputerIcon,
    Logout03Icon,
    Menu01Icon,
    Moon02Icon,
    Sun01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from './LanguageSwitcher'
import type { ThemeMode } from './ThemeToggle'
import ThemeToggle, { useTheme } from './ThemeToggle'

import { Button } from '#/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useClientAuth } from '#/lib/client/auth-context/index'
import type { SupportedLanguage } from '#/lib/i18n/config'
import { supportedLanguages } from '#/lib/i18n/config'

const navLinkClass =
    'relative rounded-lg px-2 py-1 text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-px hover:bg-muted/60 hover:text-foreground sm:px-2.5 after:absolute after:-bottom-1 after:left-1/2 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-primary/70 after:opacity-0 after:transition-all after:duration-300 after:ease-out after:content-[""]'
const navLinkActiveClass =
    'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25),0_0_24px_hsl(var(--primary)/0.12)] after:w-8 after:opacity-100'

export default function Header() {
    const headerRef = useRef<HTMLElement | null>(null)
    const { loggedIn, logout } = useClientAuth()
    const { t } = useTranslation('common')

    useEffect(() => {
        const headerElement = headerRef.current
        if (!headerElement) {
            return
        }

        const updateHeaderHeightVar = () => {
            document.body.style.setProperty('--header-height', `${headerElement.offsetHeight}px`)
        }

        updateHeaderHeightVar()

        const observer = new ResizeObserver(() => {
            updateHeaderHeightVar()
        })

        observer.observe(headerElement)
        window.addEventListener('resize', updateHeaderHeightVar)

        return () => {
            observer.disconnect()
            window.removeEventListener('resize', updateHeaderHeightVar)
            document.body.style.removeProperty('--header-height')
        }
    }, [])

    async function onLogout() {
        await logout()
    }

    return (
        <header
            ref={headerRef}
            className="fixed w-full top-0 z-50 border-b border-border bg-background/80 px-4"
        >
            <nav className="mx-auto w-full max-w-5xl py-2">
                <div className="flex items-center gap-2 sm:gap-4">
                    <h2 className="shrink-0 m-0 min-w-0 text-base font-semibold tracking-tight">
                        <Link
                            disabled={!loggedIn}
                            to="/saved-passwords"
                            className="inline-flex min-w-0 max-w-full items-center gap-0 sm:gap-2 rounded-xl border border-border bg-card/80 px-2 py-1.5 text-foreground no-underline shadow-sm sm:px-3"
                        >
                            <img
                                src="/dpm-logo.webp"
                                alt={t('logo_alt')}
                                className="h-9 w-9 rounded-md border border-border/70 bg-background/60 object-cover"
                            />
                            <span className="min-w-0 leading-tight">
                                <span className="hidden truncate text-sm font-semibold sm:block">
                                    {t('app_name')}
                                </span>
                                <span className="hidden text-xs text-muted-foreground sm:block">
                                    {t('app_subtitle')}
                                </span>
                            </span>
                        </Link>
                    </h2>

                    {/* Nav links — always on the same row */}
                    <div className="flex grow items-center gap-3 text-xs font-semibold sm:gap-4 sm:text-sm">
                        {loggedIn == true ? (
                            <LoggedInLinks />
                        ) : loggedIn == false ? (
                            <LoggedOutLinks />
                        ) : null}
                    </div>

                    {/* Desktop controls */}
                    <div className="hidden items-center gap-1.5 md:flex md:gap-2">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        {loggedIn && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={onLogout}
                                className="inline-flex h-8 items-center gap-1.5 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                            >
                                <HugeiconsIcon icon={Logout03Icon} size={14} strokeWidth={1.9} />
                                {t('logout_button')}
                            </Button>
                        )}
                    </div>

                    {/* Mobile menu */}
                    <div className="md:hidden">
                        <MobileActionsMenu onLogout={onLogout} />
                    </div>
                </div>
            </nav>
        </header>
    )
}

function LoggedInLinks() {
    const { t } = useTranslation('common')
    return (
        <>
            <Link
                to="/saved-passwords"
                className={navLinkClass}
                activeProps={{
                    className: navLinkActiveClass,
                }}
            >
                {t('nav_vault')}
            </Link>
            <Link
                to="/settings"
                className={navLinkClass}
                activeProps={{
                    className: navLinkActiveClass,
                }}
            >
                {t('nav_settings')}
            </Link>
        </>
    )
}

function LoggedOutLinks() {
    const { t } = useTranslation('common')
    return (
        <>
            <Link
                to="/auth/login"
                className={navLinkClass}
                activeProps={{
                    className: navLinkActiveClass,
                }}
            >
                {t('nav_login')}
            </Link>
            <Link
                to="/auth/register"
                className={navLinkClass}
                activeProps={{
                    className: navLinkActiveClass,
                }}
            >
                {t('nav_register')}
            </Link>
        </>
    )
}

const languageMeta: Record<SupportedLanguage, { flag: string; label: string }> = {
    en: { flag: '🇬🇧', label: 'English' },
    it: { flag: '🇮🇹', label: 'Italiano' },
}

const themeIcons: Record<ThemeMode, typeof ComputerIcon> = {
    auto: ComputerIcon,
    dark: Moon02Icon,
    light: Sun01Icon,
}

function MobileActionsMenu({ onLogout }: { onLogout: () => Promise<void> }) {
    const { loggedIn } = useClientAuth()
    const { mode, setTheme } = useTheme()
    const { i18n, t } = useTranslation(['common', 'theme'])
    const currentLang = (i18n.language.split('-')[0] ?? 'en') as SupportedLanguage

    const themeModes: ThemeMode[] = ['light', 'dark', 'auto']

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 w-8 px-0"
                        aria-label="Open menu"
                    >
                        <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.9} />
                    </Button>
                }
            ></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                {supportedLanguages.map((lang) => {
                    const { flag, label } = languageMeta[lang]
                    return (
                        <DropdownMenuItem
                            key={lang}
                            onClick={() => i18n.changeLanguage(lang).catch(() => {})}
                            data-active={currentLang === lang}
                            className="gap-2 data-[active=true]:font-semibold"
                        >
                            <span aria-hidden="true">{flag}</span>
                            {label}
                        </DropdownMenuItem>
                    )
                })}
                <DropdownMenuSeparator />
                {themeModes.map((m) => (
                    <DropdownMenuItem
                        key={m}
                        onClick={() => setTheme(m)}
                        data-active={mode === m}
                        className="gap-2 data-[active=true]:font-semibold"
                    >
                        <HugeiconsIcon icon={themeIcons[m]} size={15} strokeWidth={1.8} />
                        {t(`theme:mode_${m}`)}
                    </DropdownMenuItem>
                ))}
                {loggedIn && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onLogout().catch(() => {})}
                            className="gap-2 text-destructive focus:text-destructive"
                        >
                            <HugeiconsIcon icon={Logout03Icon} size={15} strokeWidth={1.9} />
                            {t('common:logout_button')}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
