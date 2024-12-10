import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: "Rise 'n Shine",
        short_name: 'RNS',
        start_url: '/rns/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        scope: '/',
        icons: [
          {
            src: 'rns192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'rns512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
