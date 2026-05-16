import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Set VITE_BASE_URL=/oudolf-garden/ in your GitHub Actions workflow
// or .env.production to match your repository name.
export default defineConfig({
  plugins: [react()],
  base: process.env['VITE_BASE_URL'] ?? '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
