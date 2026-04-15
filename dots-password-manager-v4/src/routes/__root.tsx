import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import React, { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { Toaster } from 'sonner'

import i18n from '#/lib/i18n/config'

import Footer from '../components/Footer'
import Header from '../components/Header'
import appCss from '../styles.css?url'

import { ClientAuthProvider } from '#/lib/client/auth-context/index'
import { getAuthSessionServerFn } from '#/lib/shared/server-functions/auth'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
    loader: async () => {
        const session = await getAuthSessionServerFn()
        return {
            initialLoggedIn: session.LoggedIn,
        }
    },
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
            {
                name: 'theme-color',
                content: '#96A4FB',
            },
        ],
        links: [
            {
                rel: 'stylesheet',
                href: appCss,
            },
            {
                rel: 'manifest',
                href: '/manifest.json',
            },
            {
                rel: 'apple-touch-icon',
                href: '/android/android-launchericon-192-192.png',
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
    let initialLoggedIn = false

    try {
        initialLoggedIn = Route.useLoaderData().initialLoggedIn
    } catch {
        initialLoggedIn = false
    }
    const [toasterTheme, setToasterTheme] = useState<'light' | 'dark'>('light')
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        gcTime: 5 * 60_000,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    )

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

    useEffect(() => {
        if (!('serviceWorker' in navigator)) {
            return
        }

        if (!import.meta.env.PROD) {
            navigator.serviceWorker
                .getRegistrations()
                .then((registrations) =>
                    Promise.all(registrations.map((registration) => registration.unregister())),
                )
                .catch(() => {
                    // Ignore cleanup errors in local dev.
                })

            return
        }

        import('virtual:pwa-register')
            .then(({ registerSW }) => {
                registerSW({ immediate: true })
            })
            .catch(() => {
                // Keep app boot resilient even if SW registration fails.
            })
    }, [])

    useEffect(() => {
        function syncLang() {
            document.documentElement.lang = i18n.language.split('-')[0]
        }
        syncLang()
        i18n.on('languageChanged', syncLang)
        return () => {
            i18n.off('languageChanged', syncLang)
        }
    }, [])

    return (
        <html lang="en" suppressHydrationWarning className="h-dvh overflow-hidden">
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
                <HeadContent />
            </head>
            <body
                className="font-sans antialiased wrap-anywhere h-dvh overflow-auto flex flex-col"
                style={{ '--header-height': '4.5rem' } as React.CSSProperties}
            >
                <I18nextProvider i18n={i18n}>
                    <QueryClientProvider client={queryClient}>
                        <ClientAuthProvider initialLoggedIn={initialLoggedIn}>
                            <Header />
                            <div className="fixed h-dvh w-full bg-background/60"></div>
                            <div
                                className="fixed h-dvh inset-0 -z-10 bg-cover hidden dark:block"
                                style={{ backgroundImage: 'url(/wallpaper-dark.webp)' }}
                            ></div>
                            <div
                                className="fixed h-dvh inset-0 -z-10 bg-cover block dark:hidden"
                                style={{ backgroundImage: 'url(/wallpaper-light.webp)' }}
                            ></div>

                            <main
                                role="main"
                                className="relative grow flex flex-col *:bg-background/50 dark:*:bg-background/60 lg:*:border-x border-border"
                            >
                                <div className="max-w-6xl *:h-full w-full min-h-dvh mx-auto pt-(--header-height) pb-(--footer-height)">
                                    {children}
                                </div>
                            </main>
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
                    </QueryClientProvider>
                </I18nextProvider>
                <Scripts />
            </body>
        </html>
    )
}
