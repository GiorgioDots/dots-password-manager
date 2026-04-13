import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import type { WarningHandlerWithDefault } from 'rollup'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

const onRollupWarn: WarningHandlerWithDefault = (warning, defaultHandler) => {
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.id?.includes('/node_modules/')) {
        return
    }

    defaultHandler(warning)
}

const config = defineConfig(({ mode }) => ({
    build: {
        rollupOptions: {
            onwarn: onRollupWarn,
            output: {
                manualChunks: (id) => {
                    if (!id.includes('node_modules')) {
                        return
                    }

                    if (id.includes('@tanstack/react-query')) {
                        return 'react-query'
                    }

                    if (id.includes('@tanstack/react-router')) {
                        return 'react-router'
                    }

                    if (id.includes('@tanstack/react-devtools')) {
                        return 'react-devtools'
                    }

                    if (id.includes('@hugeicons')) {
                        return 'hugeicons'
                    }

                    if (id.includes('zod')) {
                        return 'zod'
                    }
                },
            },
        },
    },
    plugins: [
        devtools(),
        tsconfigPaths({ projects: ['./tsconfig.json'] }),
        tailwindcss(),
        VitePWA({
            disable: mode !== 'production',
            registerType: 'autoUpdate',
            injectRegister: false,
            outDir: '.output/public',
            manifest: false,
            includeAssets: ['logo_black.ico', 'logo_white.ico', 'dpm-logo.webp'],
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true,
            },
        }),
        tanstackStart(),
        nitro({
            preset: 'bun',
            compressPublicAssets: { gzip: true, brotli: true },
            rollupConfig: {
                onwarn: onRollupWarn,
            },
        }),
        viteReact(),
        analyzer({
            enabled: false,
            analyzerMode: 'static',
        }),
    ],
}))

export default config
