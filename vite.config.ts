import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "WeatherBoard UAE",
        short_name: "WeatherBoard",
        description: "UAE weather app with AI, maps and destination intelligence",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        // cache weather api response for offline use
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/weather\.visualcrossing\.com\/.*/i,
            handler: "staleWhileRevalidate",
            options: {
              cacheName: "weather-api-cache",
              expiration: {maxEntries: 50, maxAgeSeconds: 600}, // 10 min
              cacheableResponse: {statuses: [0, 200]},
            },
          },
          {
            // never cache api respose 
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
            handler: "NetworkOnly",
          },
          {
            // cache mao title 
            urlPattern: /^https:\/\/.*\.basemaps\.cartocdn\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "map-titles-cache",
              expiration: {
                maxEntries: 200, 
                maxAgeSeconds: 86400,  // 1day
              },  
              cacheableResponse: {statuses : [0, 200]},
            },
          },
        ],
      },
    }),
  ],

  // warn if any chunk exceed 500Kb

  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // split vendor code for better cacjing
        manualChunks: {
          react: ["react", "react-dom"],
          leaflet: ["leaflet", "react-leaflet"],
          lucide: ["lucide-react"],
        },
      },
    },
},


});
