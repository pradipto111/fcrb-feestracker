import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/react-router-dom/")
          ) {
            return "vendor-react";
          }

          if (id.includes("/framer-motion/")) {
            return "vendor-motion";
          }

          // Split charting by usage: keep polar (pie/radar) separate from cartesian charts.
          if (
            id.includes("/recharts/es6/polar/") ||
            id.includes("/recharts/es6/chart/PieChart")
          ) {
            return "vendor-charts-polar";
          }

          if (id.includes("/recharts/") || id.includes("/victory-vendor/")) {
            return "vendor-charts-core";
          }

          // Keep spreadsheet parsing independent from PDF generation.
          if (id.includes("/xlsx/")) {
            return "vendor-xlsx";
          }

          // PDF export path in Academy report.
          if (id.includes("/jspdf/") || id.includes("/html2canvas/")) {
            return "vendor-pdf";
          }

          return undefined;
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


