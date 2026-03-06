import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts")) return "vendor-recharts";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("xlsx")) return "vendor-xlsx";
          if (id.includes("@dnd-kit")) return "vendor-dnd";
          if (id.includes("jspdf") || id.includes("html2canvas")) return "vendor-docs";
          if (id.includes("react-icons")) return "vendor-icons";
          if (id.includes("lenis")) return "vendor-scroll";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("react-dom") || id.includes("/react/")) return "vendor-react";
          return "vendor";
        },
      },
    },
  },
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


