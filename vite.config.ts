import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // 部署到 www.hukun.work/mogu 时用 /mogu/；GitHub Actions 部署时用仓库路径
  base: process.env.GITHUB_PAGES === "true" ? "/fetal_movement_for_mogu/" : "/mogu/",
  // 部署到子路径 /mogu 时，构建产物放到 dist/mogu，便于 Vercel 等托管
  build: {
    outDir: process.env.GITHUB_PAGES === "true" ? "dist" : "dist/mogu",
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      manifest: {
        name: "孕期数胎动",
        short_name: "胎动",
        description: "本地孕期助手：数胎动、宫缩计时、待产包清单，数据仅存本地。",
        theme_color: "#58CC02",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/mogu/",
        start_url: "/mogu/",
        icons: [
          { src: "/mogu/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
          { src: "/mogu/apple-touch-icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/mogu/apple-touch-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/mogu/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "maskable" },
          { src: "/mogu/apple-touch-icon.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/mogu/apple-touch-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
});
