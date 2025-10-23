import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Allow external connections for development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'lite-kideko-aggregates.onrender.com',
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Ensure assets are served with relative paths
    assetsDir: 'assets'
  }
})

