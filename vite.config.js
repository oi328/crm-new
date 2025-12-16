import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  base: '/new/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['react-icons/si']
  },
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
        "font-src 'self' https://fonts.gstatic.com;",
        "img-src 'self' data: blob: https://i.pravatar.cc https://img.icons8.com;",
        "connect-src 'self' ws: wss: https://restcountries.com;",
        "worker-src 'self' blob:;",
        "child-src 'self' blob:;",
        "frame-ancestors 'self';",
        "base-uri 'self';",
        "form-action 'self';"
      ].join(' ')
    }
  },
  build: { sourcemap: true },
  resolve: {
    alias: {
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@router': path.resolve(__dirname, 'src/router'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@providers': path.resolve(__dirname, 'src/providers'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@config': path.resolve(__dirname, 'src/config'),
    },
  },
})
