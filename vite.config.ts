import { PluginOption, defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import BuildInfo from 'vite-plugin-info'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { visualizer } from 'rollup-plugin-visualizer'
import { createRequire } from 'node:module'
import path from 'node:path'
import fs from 'node:fs/promises'
import url from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
      host: '0.0.0.0',
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'offline.html',
                'favicon.svg',
                'favicon.ico',
                'robots.txt',
                'apple-touch-icon.png',
            ],
            manifest: {
                "theme_color" : "#023059",
                "background_color" : "#023059",
                "display" : "standalone",
                "scope" : "/",
                "start_url" : "/",
                "name" : "Concurrent",
                "short_name" : "Concurrent",
                icons: [
                    {
                        "src": "192.png",
                        "sizes": "192x192",
                        "type": "image/png",
                        "purpose": "maskable"
                    },
                    {
                        "src": "512.png",
                        "sizes": "512x512",
                        "type": "image/png",
                        "purpose": "maskable"
                    },
                    {
                        "src": "splash.png",
                        "sizes": "300x300",
                        "type": "image/png",
                        "purpose": "any"
                    }
                ]
            },
            workbox: {
                cleanupOutdatedCaches: true,
                skipWaiting: true,
                clientsClaim: true,
                globDirectory: 'dist',
                globPatterns: ['**/*.{js,css,png,jpg,jpeg,svg,gif,woff,woff2,eot,ttf,otf,mp3}'],
                runtimeCaching: [
                    {
                        urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                            },
                        },
                    },
                    {
                        urlPattern: /.*\.(?:js|css)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'static-cache',
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                            },
                        },
                    },
                    {
                        urlPattern: /.*\.(?:woff|woff2|eot|ttf|otf)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'font-cache',
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                            },
                        },
                    },
                    {
                        urlPattern: /.*\.(?:mp3)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'audio-cache',
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                            },
                        },
                    },
                ],
            }
        }),
        BuildInfo(),
        basicSsl(),
        visualizer(),
        reactVirtualized(),
    ],
})

const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`

function reactVirtualized(): PluginOption {
  return {
    name: 'flat:react-virtualized',
    // Note: we cannot use the `transform` hook here
    //       because libraries are pre-bundled in vite directly,
    //       plugins aren't able to hack that step currently.
    //       so instead we manually edit the file in node_modules.
    //       all we need is to find the timing before pre-bundling.
    configResolved: async () => {
      const require = createRequire(import.meta.url)
      const reactVirtualizedPath = require.resolve('react-virtualized')
      const { pathname: reactVirtualizedFilePath } = new url.URL(reactVirtualizedPath, import.meta.url)
      const file = reactVirtualizedFilePath
        .replace(
          path.join('dist', 'commonjs', 'index.js'),
          path.join('dist', 'es', 'WindowScroller', 'utils', 'onScroll.js'),
        )
      const code = await fs.readFile(file, 'utf-8')
      const modified = code.replace(WRONG_CODE, '')
      await fs.writeFile(file, modified)
    },
  }
}
