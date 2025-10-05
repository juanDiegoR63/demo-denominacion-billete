import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite acceso desde otros dispositivos en la red
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 4173,
  }
})
