import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
    strictPort: false,
    allowedHosts: [
      ".onrender.com",
      "fcrb-frontend.onrender.com",
      "localhost"
    ]
  }
});


