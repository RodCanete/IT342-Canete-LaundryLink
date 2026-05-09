import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      // Mirror the '@' alias from vite.config.ts: resolves to the web/ root
      '@': path.resolve(__dirname, '.'),
    },
  },
})
