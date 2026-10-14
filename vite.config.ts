import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
      '@game': fileURLToPath(new URL('./src/game', import.meta.url)),
    },
  },
  build: { outDir: 'dist', chunkSizeWarningLimit: 2000 },
  server: { port: 3000 },
});
