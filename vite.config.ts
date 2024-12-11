import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'src/dist',
    emptyOutDir: true
  },
  server: {
    host: true, // Listen on all local IPs
    port: 5174, // Default Vite port
    strictPort: true, // This will make Vite fail if port 5174 is not available instead of trying another port
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});