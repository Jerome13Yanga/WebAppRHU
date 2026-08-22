const CACHE_NAME = "rhu-health-shell-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./offline.html",
  "./style.css",
  "./app.js",
  "./logo.jpg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png",
  "./icon-180.png",
  "./icon-32.png",
  "./icon-16.png",
  "./screenshot-wide.png",
  "./screenshot-narrow.png",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Always use Network-First / Network-Only for Supabase API or non-GET requests
  if (url.hostname.includes("supabase") || event.request.method !== "GET") {
    return;
  }

  // Handle navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("./index.html")
          .then((response) => response || caches.match("./offline.html"));
      })
    );
    return;
  }

  // Stale-while-revalidate for local static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse || caches.match("./offline.html"));

      return cachedResponse || fetchPromise;
    })
  );
});
