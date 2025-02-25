import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Ensures it works on both Windows & Docker (Linux)
    port: 5173,  // Default Vite port
  },
  esbuild: {
    target: 'esnext',  // Avoid setting `platform: 'linux'`
  },
})
