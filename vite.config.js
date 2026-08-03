import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Route /api requests to local FastAPI backend in development
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      // Proxy all /overpass/* requests to overpass-api.de — bypasses CORS + IP blocks in dev
      '/overpass': {
        target: 'https://overpass-api.de',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/overpass/, '/api/interpreter'),
        secure: true,
      },
      '/overpass2': {
        target: 'https://overpass.kumi.systems',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/overpass2/, '/api/interpreter'),
        secure: true,
      },
    },
  },
});
