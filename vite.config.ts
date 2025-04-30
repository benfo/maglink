import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

const base = "/maglink/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    flowbiteReact(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: "auto",
      injectManifest: {
        rollupFormat: "iife",
      },
      registerType: "autoUpdate",
      // devOptions: {
      //   enabled: true,
      // },
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Magnet Link Generator",
        short_name: "MagLinkGen",
        description: "A simple magnet link generator",
        theme_color: "#ffffff",
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        share_target: {
          action: `${base}share-target`,
          method: "POST",
          enctype: "multipart/form-data",
          params: {
            title: "title",
            text: "text",
          },
        },
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
});
