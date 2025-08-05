import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Set the base path to the subfolder
  base: "/rns/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Rise 'n Shine",
        short_name: "RNS",
        start_url: "/rns/",
        display: "standalone",
        background_color: "#111827",
        theme_color: "#111827",
        scope: "/rns/",
        icons: [
          {
            src: "rns192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "rns512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
      "/socket": {
        target: "ws://localhost:8081",
        ws: true,
      },
    },
  },
});
