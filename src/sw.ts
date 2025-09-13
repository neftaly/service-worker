import {defaultCache} from "@serwist/vite/worker";
import {type PrecacheEntry, type SerwistGlobalConfig, Serwist} from "serwist";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    // Change this attribute's name to your `injectionPoint`.
    // `injectionPoint` is an InjectManifest option.
    // See https://serwist.pages.dev/docs/build/configuring
    __SW_MANIFEST: Array<PrecacheEntry | string> | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const serwist = new Serwist({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  runtimeCaching: defaultCache,
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
void serwist.addEventListeners();
