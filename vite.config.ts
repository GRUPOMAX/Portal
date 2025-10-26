// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // carrega .env*
  return {
    plugins: [react()],
    base: env.VITE_BASE || '/', // VPS: '/', GH Pages: '/Portal/'
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: { port: 5173, strictPort: true },
  }
})
