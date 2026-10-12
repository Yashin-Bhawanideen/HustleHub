import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// In development, requests to /api are forwarded to the Express backend,
// so the browser sees one origin (no CORS headaches).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js']
  }
});