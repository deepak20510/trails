import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    hmr: {
      overlay: false, // Disable Vite error overlay
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/materials": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/health": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
