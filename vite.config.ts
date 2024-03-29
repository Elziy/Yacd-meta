import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __VERSION__: JSON.stringify(pkg.version),
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.PUBLIC_URL': JSON.stringify('./'),
  },
  base: './',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  publicDir: 'assets',
  build: {
    // sourcemap: true,
    // the default value is 'dist'
    // which make more sense
    // but change this may break other people's tools
    outDir: 'public',
  },
  server: {
    port: 80,
    host: '0.0.0.0',
    // 允许局域网访问
    allowLocalhost: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5555',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      srcDir: 'src',
      outDir: 'public',
      filename: 'sw.ts',
      strategies: 'injectManifest',
      base: './',
      manifest: {
        icons: [
          {
            src: 'apple-touch-icon-precomposed.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
}));
