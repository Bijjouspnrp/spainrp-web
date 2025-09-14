
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
      // Proxy para endpoints administrativos
      '/api/admin-records': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
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
      // --- PROXY API BOLSA (API Externa) ---
      '/api/proxy/bolsa/saldo': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/bolsa', '/api/bolsa')
      },
      '/api/proxy/bolsa/comprar': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/bolsa', '/api/bolsa')
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
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/bolsa', '/api/bolsa')
      },
      '/api/proxy/bolsa/vender': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/bolsa', '/api/bolsa')
      },
      '/api/proxy/bolsa/inversiones': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/bolsa', '/api/bolsa')
      },
      '/api/proxy/bolsa/activos': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/bolsa', '/api/bolsa')
      },
      // --- PROXY API BLACKMARKET (API Externa) ---
      '/api/proxy/blackmarket/purchase': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/blackmarket', '/api/blackmarket')
      },
      '/api/proxy/blackmarket/sell': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/blackmarket', '/api/blackmarket')
      },
      '/api/proxy/blackmarket/sellone': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/blackmarket', '/api/blackmarket')
      },
      '/api/proxy/blackmarket/items': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/blackmarket', '/api/blackmarket')
      },
      '/api/proxy/blackmarket/inventario': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/blackmarket', '/api/blackmarket')
      },
      '/api/proxy/blackmarket/saldo': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/blackmarket', '/api/blackmarket')
      },
      // --- PROXY API DISCORD ---
      '/api/proxy/discord/ismember': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/api/proxy/discord/hasrole': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // --- PROXY API ADMIN (API Externa) ---
      '/api/proxy/admin/isadmin': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/admin', '/api/admin')
      },
      '/api/proxy/admin/search': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/admin', '/api/admin')
      },
      '/api/proxy/admin/inventory': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/admin', '/api/admin')
      },
      '/api/proxy/admin/balance': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/admin', '/api/admin')
      },
      '/api/proxy/admin/additem': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/admin', '/api/admin')
      },
      '/api/proxy/admin/removeitem': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/admin', '/api/admin')
      },
      '/api/proxy/admin/setbalance': {
        target: 'http://37.27.21.91:5021',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace('/api/proxy/admin', '/api/admin')
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
