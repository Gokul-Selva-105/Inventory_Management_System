import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host:true, // for seeing in mobile
    port: 5175, // Changed to port 5175 to avoid conflicts
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:5001", // Updated to match backend port
        changeOrigin: true,
        secure: false
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: process.env.NODE_ENV !== "production",
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
