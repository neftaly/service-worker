import {Serwist} from "@serwist/window";

// Feature detection for ServiceWorker ES module support
// https://github.com/w3c/ServiceWorker/issues/1582
const hasModuleSupport = (() => {
  if (!navigator?.serviceWorker) {
    return false;
  }

  let readType = false;
  navigator.serviceWorker
    .register("about:blank", {
      get type() {
        readType = true;
        return undefined;
      },
    })
    // eslint-disable-next-line promise/prefer-await-to-then
    .catch(() => undefined);
  return readType;
})();

const registerSw = () => {
  const serwist = new Serwist(
    hasModuleSupport ? "./sw-module.js" : "./sw-classic.js",
    {
      scope: "/",
      type: hasModuleSupport ? "module" : "classic",
    },
  );

  // Log update messages
  serwist.addEventListener("message", event => {
    if (event.data.meta === "serwist-broadcast-update") {
      console.log(event.data.meta, event.data.type, event.data);
    }
  });
};

export default registerSw;
