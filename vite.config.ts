import { serwist } from "@serwist/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    serwist({
      swSrc: "src/sw.ts",
      globDirectory: "dist",
      swDest: "sw-classic.js",
      injectionPoint: "self.__SW_MANIFEST",
      type: "classic",
      rollupFormat: "iife",
    }),
  ],
});
