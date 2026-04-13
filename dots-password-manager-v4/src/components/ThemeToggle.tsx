import { ComputerIcon, Moon02Icon, Sun01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'

import { Button } from './ui/button'
import { Spinner } from './ui/spinner'

type ThemeMode = 'light' | 'dark' | 'auto'

function getInitialMode(): ThemeMode {
    if (typeof window === 'undefined') {
        return 'auto'
    }

    const stored = window.localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored
    }

    return 'auto'
}

function applyThemeMode(mode: ThemeMode) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = mode === 'auto' ? (prefersDark ? 'dark' : 'light') : mode

    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(resolved)

    if (mode === 'auto') {
        document.documentElement.removeAttribute('data-theme')
    } else {
        document.documentElement.setAttribute('data-theme', mode)
    }

    document.documentElement.style.colorScheme = resolved
}

export default function ThemeToggle() {
    const [mode, setMode] = useState<ThemeMode | undefined>(undefined)

    useEffect(() => {
        const initialMode = getInitialMode()
        setMode(initialMode)
        applyThemeMode(initialMode)
    }, [])

    useEffect(() => {
        if (mode !== 'auto') {
            return
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const onChange = () => applyThemeMode('auto')

        media.addEventListener('change', onChange)
        return () => {
            media.removeEventListener('change', onChange)
        }
    }, [mode])

    function toggleMode() {
        const nextMode: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light'
        setMode(nextMode)
        applyThemeMode(nextMode)
        window.localStorage.setItem('theme', nextMode)
    }

    const label =
        mode === 'auto'
            ? 'Theme mode: auto (system). Click to switch to light mode.'
            : `Theme mode: ${mode}. Click to switch mode.`

    return (
        <Button
            type="button"
            onClick={toggleMode}
            aria-label={label}
            title={label}
            variant={'ghost'}
            className="inline-flex h-8 items-center gap-1.5 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
            // className="inline-flex shrink-0 h-8 items-center gap-1 rounded-full border border-border bg-card/80 px-2 text-xs font-semibold text-foreground shadow-sm transition hover:-translate-y-px sm:h-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm"
        >
            {mode === undefined ? (
                <>
                    <Spinner />
                </>
            ) : (
                <>
                    <HugeiconsIcon
                        icon={
                            mode === 'auto'
                                ? ComputerIcon
                                : mode === 'dark'
                                  ? Moon02Icon
                                  : Sun01Icon
                        }
                        size={16}
                        strokeWidth={1.8}
                    />
                    <span className="hidden sm:inline">
                        {mode === 'auto' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light'}
                    </span>
                </>
            )}
        </Button>
    )
}
