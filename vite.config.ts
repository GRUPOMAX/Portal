import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  base: '/Portal/',
  plugins: [react(), tailwind()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
