import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'CineSwipe',
        short_name: 'CineSwipe',
        description: 'Cinematic Discovery Platform',
        theme_color: '#000000',
        background_color: '#000000',
        icons: []
      }
    })
  ]
})
