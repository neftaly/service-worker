/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-call */
import {serwist} from "@serwist/vite";
import react from "@vitejs/plugin-react-swc";
import {defineConfig} from "vite";
import {createHtmlPlugin} from "vite-plugin-html";

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
      // Don't use aliases for classic build - bundle everything
    }),
    serwist({
      ...serwistConfig,
      type: "module",
      swDest: "sw-module.js",
      rollupFormat: "es",
      rollupOptions: {
        resolve: {
          alias: {
            serwist: "https://esm.sh/serwist@9.2.1",
            "@serwist/core": "https://esm.sh/@serwist/core@9.2.1",
            "@serwist/vite/worker": "https://esm.sh/@serwist/vite@9.2.1/worker",
          },
        },
      },
    }),
  ],
});
