
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '8hbmeo-ip-37-201-192-151.tunnelmole.net',
      'ep8l7b-ip-37-201-192-213.tunnelmole.net'
    ],
    proxy: {
      '/api/tinder': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/roblox': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/auth': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/announcements': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/uploads/news': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // --- PROXY API BOLSA (localhost:3050) ---
      '/api/proxy/bolsa/saldo': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/proxy/bolsa/comprar': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
            // --- PROXY API DNI (localhost:3001) ---
      '/api/proxy/dni': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },

            '/api/proxy/bolsa/actualizar-precio': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/proxy/bolsa/actualizar-precios': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/proxy/bolsa/fluctuar': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/proxy/bolsa/vender': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/proxy/bolsa/inversiones': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/proxy/bolsa/activos': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
  // ...existing code...
      '/api/auth/me': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/backend': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
            '/api/maintenance': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
// ...existing code...
      '/api': {
        target: process.env.VITE_BOT_URL || 'http://localhost:3020', // El bot escucha en 3020
        changeOrigin: true,
        secure: false
      },
      // Proxy para Simulador de Tienda
      '/shop-simulator': {
        target: process.env.VITE_SHOP_URL || 'http://localhost:4002',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      // Elimina proxy /admin para que Vite maneje la ruta como SPA
    }
  }
})
