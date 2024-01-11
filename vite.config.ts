import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import BuildInfo from 'vite-plugin-info'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { visualizer } from 'rollup-plugin-visualizer'

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
        visualizer(),
    ],
})

