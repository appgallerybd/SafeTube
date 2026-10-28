/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b1bafff1'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "68098ea53b29cad437ad0d35aff356a4"
  }, {
    "url": "pwa-512x512.png",
    "revision": "72cdab2e9929cb7615daaba9a9fbb16c"
  }, {
    "url": "pwa-192x192.png",
    "revision": "92511c5affc558415032e62a1f02a86a"
  }, {
    "url": "index.html",
    "revision": "69e35bab75ba5afbd568d040ad1e77dc"
  }, {
    "url": "icon.svg",
    "revision": "8af0ca71f6fbf82b5ecd9bbd27144454"
  }, {
    "url": "favicon.ico",
    "revision": "aff2c6218870b58f0f8996052f2f6c0e"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b7b4e917c0c91fd0b79148e0ece79d83"
  }, {
    "url": "assets/index-Bs_U5ZXB.css",
    "revision": null
  }, {
    "url": "assets/index-BAQD-G35.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b7b4e917c0c91fd0b79148e0ece79d83"
  }, {
    "url": "favicon.ico",
    "revision": "aff2c6218870b58f0f8996052f2f6c0e"
  }, {
    "url": "icon.svg",
    "revision": "8af0ca71f6fbf82b5ecd9bbd27144454"
  }, {
    "url": "pwa-192x192.png",
    "revision": "92511c5affc558415032e62a1f02a86a"
  }, {
    "url": "pwa-512x512.png",
    "revision": "72cdab2e9929cb7615daaba9a9fbb16c"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "68098ea53b29cad437ad0d35aff356a4"
  }, {
    "url": "manifest.webmanifest",
    "revision": "932d59a9c40e34dd1cd54beced909481"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/img\.youtube\.com\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "yt-thumbnails-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
