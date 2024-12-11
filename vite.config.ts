import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/rns/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Rise 'n Shine",
        short_name: 'RNS',
        start_url: '/rns/',
        display: 'standalone',
        background_color: '#111827',
        theme_color: '#111827',
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
