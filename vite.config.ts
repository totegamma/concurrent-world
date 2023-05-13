import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import BuildInfo from 'vite-plugin-info'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), VitePWA({registerType: 'autoUpdate'}), BuildInfo()]
})
