const CACHE_NAME = "dwf-mobile-v1";
const APP_SHELL = [
  "/mobile",
  "/mobile/subjects",
  "/mobile/schedule",
  "/mobile/report",
  "/mobile/static/styles.css",
  "/mobile/static/app.js",
  "/mobile/static/manifest.webmanifest",
  "/mobile/static/icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (requestUrl.pathname.startsWith("/api/")) {
    return;
  }

  const isMobileNavigation = event.request.mode === "navigate" && requestUrl.pathname.startsWith("/mobile");
  if (isMobileNavigation) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cachedPage = await caches.match(requestUrl.pathname);
        if (cachedPage) {
          return cachedPage;
        }
        const fallback = await caches.match("/mobile");
        return fallback || Response.error();
      })
    );
    return;
  }

  const isMobileStatic = requestUrl.pathname.startsWith("/mobile/static/");
  if (!isMobileStatic) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      });
    })
  );
});
