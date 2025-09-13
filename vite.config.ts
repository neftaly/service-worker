import { serwist } from "@serwist/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const serwistConfig = {
  swSrc: "src/sw.ts",
  globDirectory: "dist",
  injectionPoint: "self.__SW_MANIFEST",
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    serwist({
      ...serwistConfig,
      type: "classic",
      swDest: "sw-classic.js",
      rollupFormat: "iife",
    }),
    serwist({
      ...serwistConfig,
      type: "module",
      swDest: "sw-module.js",
      rollupFormat: "es",
    }),
  ],
});
