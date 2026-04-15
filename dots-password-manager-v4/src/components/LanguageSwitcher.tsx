import { useTranslation } from 'react-i18next'

import { Button } from '#/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import type { SupportedLanguage } from '#/lib/i18n/config'
import { supportedLanguages } from '#/lib/i18n/config'

const languageMeta: Record<SupportedLanguage, { flag: string; label: string }> = {
    en: { flag: '🇬🇧', label: 'English' },
    it: { flag: '🇮🇹', label: 'Italiano' },
}

export function LanguageSwitcher() {
    const { i18n } = useTranslation()
    const currentLang = (i18n.language.split('-')[0] ?? 'en') as SupportedLanguage

    function switchTo(lang: SupportedLanguage) {
        i18n.changeLanguage(lang).catch(() => {})
    }

    const current = languageMeta[currentLang]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                type="button"
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 gap-1.5 px-2   sm:h-9 sm:px-2.5"
                        aria-label={`Language: ${current.label}`}
                    >
                        <span aria-hidden="true">{current.flag}</span>
                        <span className="hidden sm:inline">{current.label}</span>
                    </Button>
                }
            ></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {supportedLanguages.map((lang) => {
                    const { flag, label } = languageMeta[lang]
                    return (
                        <DropdownMenuItem
                            key={lang}
                            onClick={() => switchTo(lang)}
                            data-active={currentLang === lang}
                            className="gap-2 data-[active=true]:font-semibold"
                        >
                            <span aria-hidden="true">{flag}</span>
                            {label}
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
