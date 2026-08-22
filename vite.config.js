import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "web-viewer/public"),
  publicDir: path.resolve(__dirname, "web-viewer/public"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    // Express serves the API on 3000. Keep Vite on a separate port so API
    // requests do not proxy back into Vite and recurse indefinitely.
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
