import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// SPA fallback for GitHub Pages: when the user visits a deep link, Pages
// returns 404.html. Serving index.html from that path lets the SPA router
// take over.
function spa404Fallback() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const src = resolve('dist/index.html');
      const dst = resolve('dist/404.html');
      if (existsSync(src)) copyFileSync(src, dst);
    },
  };
}

export default defineConfig({
  // VITE_BASE is "/" for local dev / Firebase Hosting and "/bite-budget/"
  // when deploying to GitHub Pages.
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'bite-budget',
        short_name: 'bite',
        description: '한 끼의 가치를 기록하는 가계부',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '.',
        lang: 'ko',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
      },
    }),
    spa404Fallback(),
  ],
  server: {
    port: 5173,
  },
});
