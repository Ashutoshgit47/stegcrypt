import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  worker: {
    format: "es" as const,
  },
  build: {
    // Target modern browsers that support ESM
    target: 'esnext',
    // Inline small assets to reduce requests
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Manual chunk splitting to reduce initial bundle
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
             return 'vendor-react';
          }
          if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/lucide-react')) {
             return 'vendor-ui';
          }
          if (id.includes('node_modules/argon2-browser') || id.includes('node_modules/localforage')) {
             return 'vendor-utils';
          }
        },
      },
    },
  },
}));
