import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import istanbul from 'vite-plugin-istanbul';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    istanbul({
      include: 'src/*',
      exclude: ['node_modules', 'tests/'],
      extension: ['.js','.jsx'],
      requireEnv: false, // Allows instrumentation without an env variable
      nycrcPath: './.nycrc',
    }),
  ],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true, // Required for accurate coverage
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
