import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import BuildInfo from 'vite-plugin-info'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
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
            }
        }),
        BuildInfo(),
        basicSsl()
    ]
})
