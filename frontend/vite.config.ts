import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy external realbengaluru images to avoid ERR_BLOCKED_BY_RESPONSE.NotSameOrigin in dev
      "/realbengaluru-images": {
        target: "https://realbengaluru.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/realbengaluru-images/, "/wp-content/uploads"),
      },
    },
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
    strictPort: false,
    allowedHosts: [
      ".onrender.com",
      "fcrb-frontend.onrender.com",
      "localhost",
      "realbengaluru.com",
      "www.realbengaluru.com"
    ]
  }
});


