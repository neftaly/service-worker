import { serwist } from "@serwist/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

const serwistConfig = {
  swSrc: "src/sw.ts",
  globDirectory: "dist",
  injectionPoint: "self.__SW_MANIFEST",
};

const importMap = {
  imports: {
    serwist: "https://esm.sh/serwist@9.2.1",
    "@serwist/core": "https://esm.sh/@serwist/core@9.2.1",
    "@serwist/vite/worker": "https://esm.sh/@serwist/vite@9.2.1/worker",
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      minify: false,
      inject: {
        data: {
          importMap: JSON.stringify(importMap, null, 2),
        },
      },
    }),
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
      rollupOptions: {
        external: Object.keys(importMap.imports),
      },
    }),
  ],
});
