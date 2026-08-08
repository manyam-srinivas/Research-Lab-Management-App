import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon.svg"],
      // Enable the service worker in dev mode too, so the install icon
      // appears while running `npm run dev`.
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Research Lab Management System",
        short_name: "RLMS",
        description:
          "Research Lab Management System — manage projects, equipment, budgets and more.",
        theme_color: "#1d4ed8",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "/index.html",
        // Only GET requests to the remote API are cached (network-first), so
        // the app shell works offline without ever serving stale data from
        // mutations (POST/PUT/DELETE) or authenticated responses.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/research-lab-backend-x84w\.onrender\.com\/api\/.*/i,
            handler: "NetworkFirst",
            method: "GET",
            options: {
              cacheName: "rlms-api",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
