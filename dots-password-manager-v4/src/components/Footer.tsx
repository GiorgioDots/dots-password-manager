import { Github } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="border-t border-border/80 px-4 py-3 text-muted-foreground">
            <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs sm:text-sm">
                <p className="m-0 inline-flex items-center gap-2">
                    <img
                        src="/dpm-logo.png"
                        alt="Dots Password Manager logo"
                        className="h-5 w-5 rounded-sm border border-border/70 object-cover"
                    />
                    <span>&copy; {year} Dots Password Manager</span>
                </p>
                <div className="flex items-center gap-1">
                    <a
                        href="https://github.com/GiorgioDots/dots-password-manager"
                        target="_blank"
                        rel="noopener noreferrer"
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
