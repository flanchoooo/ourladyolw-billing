import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiProxy = {
  '/api': {
    target: process.env.VITE_API_PROXY_TARGET || 'http://207.180.223.140:9999/',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: true,
    proxy: apiProxy,
  },
  server: {
    port: 5173,
    proxy: apiProxy,
  },
});
