import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwind()],
  base: '/Portal/', // <<< importante pro GitHub Pages
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
