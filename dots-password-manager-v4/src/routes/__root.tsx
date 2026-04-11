import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Footer from '../components/Footer'
import Header from '../components/Header'

import appCss from '../styles.css?url'
import { ClientAuthProvider } from '#/lib/client/auth-context'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'Dots Password Manager',
            },
            {
                name: 'description',
                content: 'Manage your password easily and securely',
            },
        ],
        links: [
            {
                rel: 'stylesheet',
                href: appCss,
            },
            {
                rel: 'icon',
                type: 'image/x-icon',
                href: '/logo_black.ico',
            },
            {
                rel: 'icon',
                type: 'image/x-icon',
                href: '/logo_black.ico',
                media: '(prefers-color-scheme: light)',
            },
            {
                rel: 'icon',
                type: 'image/x-icon',
                href: '/logo_white.ico',
                media: '(prefers-color-scheme: dark)',
            },
        ],
    }),
    shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
    const [toasterTheme, setToasterTheme] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        function syncTheme() {
            const isDark = document.documentElement.classList.contains('dark')
            setToasterTheme(isDark ? 'dark' : 'light')
        }

        syncTheme()

        const observer = new MutationObserver(syncTheme)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        })

        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const onMediaChange = () => {
            const isAuto = !document.documentElement.hasAttribute('data-theme')
            if (isAuto) {
                syncTheme()
            }
        }

        media.addEventListener('change', onMediaChange)

        return () => {
            observer.disconnect()
            media.removeEventListener('change', onMediaChange)
        }
    }, [])

    return (
        <html lang="en" suppressHydrationWarning className="h-full overflow-hidden">
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
                <HeadContent />
            </head>
            <body className="font-sans antialiased wrap-anywhere flex h-dvh flex-col overflow-hidden">
                <ClientAuthProvider>
                    <Header />
                    <div className="grow min-h-0 overflow-auto">{children}</div>
                    <Footer />
                    <Toaster richColors position="top-right" theme={toasterTheme} />
                    <TanStackDevtools
                        config={{
                            position: 'bottom-right',
                        }}
                        plugins={[
                            {
                                name: 'Tanstack Router',
                                render: <TanStackRouterDevtoolsPanel />,
                            },
                        ]}
                    />
                </ClientAuthProvider>
                <Scripts />
            </body>
        </html>
    )
}
