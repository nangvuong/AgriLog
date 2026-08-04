import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'agrilog-shared': path.resolve(__dirname, '../agrilog-shared/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://Macs-Vuong.local:3000',
        changeOrigin: true,
      },
    },
    allowedHosts: ["washout-diagnosis-dimly.ngrok-free.dev"],
  },
});