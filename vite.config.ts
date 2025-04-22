import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

const SSL_PRIVATE_KEY = 'secrets/web.key';
const SSL_CERTIFICATE = 'secrets/web.crt';
const API_CERTIFICATE = 'secrets/api.crt';
const ENABLE_HTTPS = false;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: ENABLE_HTTPS ? {
      key: fs.readFileSync(SSL_PRIVATE_KEY),
      cert: fs.readFileSync(SSL_CERTIFICATE),
    } : undefined,
    proxy: {
      '/api': {
        target: {
          protocol: 'https:',
          host: 'localhost',
          port: 8000,
          ca: ENABLE_HTTPS ? fs.readFileSync(API_CERTIFICATE).toString() : undefined,
        },
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
