import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
    },
  },
  build: {
    sourcemap: true,
  },
  server: {
    open: true,
    host: true,
  },
  define: {
    __DEBUG__: JSON.stringify(true),
  },
  base: 'https://grades-site.onrender.com',
})