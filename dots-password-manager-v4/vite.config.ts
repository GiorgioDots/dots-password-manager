import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

const config = defineConfig(({ mode }) => ({
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
        nitro({ preset: 'bun', compressPublicAssets: { gzip: true, brotli: true } }),
        viteReact(),
    ],
}))

export default config
