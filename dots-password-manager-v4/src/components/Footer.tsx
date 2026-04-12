import { useEffect, useRef } from 'react'

import { Github } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function Footer() {
    const footerRef = useRef<HTMLElement | null>(null)
    const year = new Date().getFullYear()

    useEffect(() => {
        const footerElement = footerRef.current
        if (!footerElement) {
            return
        }

        const updateFooterHeightVar = () => {
            document.body.style.setProperty('--footer-height', `${footerElement.offsetHeight}px`)
        }

        updateFooterHeightVar()

        const observer = new ResizeObserver(() => {
            updateFooterHeightVar()
        })

        observer.observe(footerElement)
        window.addEventListener('resize', updateFooterHeightVar)

        return () => {
            observer.disconnect()
            window.removeEventListener('resize', updateFooterHeightVar)
            document.body.style.removeProperty('--footer-height')
        }
    }, [])

    return (
        <footer
            ref={footerRef}
            className="fixed bottom-0 w-full border-t border-border/80 px-4 py-3 text-muted-foreground bg-background/80"
        >
            <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs sm:text-sm">
                <p className="m-0 inline-flex items-center gap-2">
                    <img
                        src="/dpm-logo.webp"
                        alt="Dots Password Manager logo"
                        className="h-5 w-5 rounded-sm border border-border/70 object-cover"
                    />
                    <span>&copy; {year} Dots Password Manager</span>
                </p>
                <div className="flex items-center gap-1">
                    <a
                        href="https://github.com/GiorgioDots/dots-password-managerr"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open developer's GitHub repository"
                    >
                        <HugeiconsIcon
                            icon={Github}
                            className="size-5"
                            strokeWidth={0}
                            fill="var(--primary)"
                        />
                    </a>
                </div>
            </div>
        </footer>
    )
}
