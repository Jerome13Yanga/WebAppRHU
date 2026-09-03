/**
 * Service Worker: Offline Caching & Web Push Notifications
 * Padre Burgos RHU Maternal and Infant Health Monitoring System
 */

const CACHE_NAME = "rhu-health-shell-v8";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./offline.html",
  "./style.css",
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
  "./manifest.json",
  "./src/app.js",
  "./src/config.js",
  "./src/db.js",
  "./src/auth.js",
  "./src/sync.js",
  "./src/ui/dashboard.js",
  "./src/ui/maternal.js",
  "./src/ui/infants.js",
  "./src/ui/checkupHistory.js",
  "./src/ui/schedules.js",
  "./src/ui/reminders.js",
  "./src/ui/reports.js",
  "./src/ui/maternalCardForm.js",
  "./src/ui/infantCardForm.js",
  "./src/ui/prenatalClinicalForm.js",
  "./src/ui/backup.js",
  "./src/ui/components.js",
  "./src/ui/pixelArt.js",
  "./src/utils/excelExport.js",
  "./src/utils/sanitize.js",
  "./src/utils/theme.js",
  "./src/utils/notifications.js"
];

// --- 1. INSTALL & CACHE LIFECYCLE ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// --- 2. ACTIVATE & OLD CACHE PURGE ---
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

// --- 3. FETCH INTERCEPTION (NETWORK-FIRST WITH CACHE FALLBACK) ---
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

  // Network-first with Cache fallback for all local scripts and assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || (event.request.destination === "image" ? null : caches.match("./offline.html"));
        });
      })
  );
});

// --- 4. WEB PUSH NOTIFICATIONS FOR IMMUNIZATION & MATERNAL ALERTS ---
self.addEventListener("push", (event) => {
  let data = {
    title: "RHU Health Alert",
    body: "You have an upcoming maternal or child health reminder from Padre Burgos RHU.",
    tag: "rhu-general-alert",
    url: "./"
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const title = data.title || "Padre Burgos RHU Health Notification";
  const options = {
    body: data.body || "Please check your RHU Health Portal for important schedule details.",
    icon: "./icon-192.png",
    badge: "./icon-32.png",
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || "rhu-immunization-reminder",
    renotify: true,
    data: {
      url: data.url || "./",
      timestamp: Date.now()
    },
    actions: [
      { action: "open", title: "View Schedule" },
      { action: "dismiss", title: "Dismiss" }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// --- 5. NOTIFICATION INTERACTION (CLICK / TAP) ---
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : "./";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus().then(() => {
            if ("navigate" in client && targetUrl) {
              return client.navigate(targetUrl);
            }
          });
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// --- 6. CLIENT MESSAGING (IN-APP NATIVE NOTIFICATION TRIGGER) ---
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "TRIGGER_NOTIFICATION") {
    const { title, options } = event.data;
    const finalOptions = {
      icon: "./icon-192.png",
      badge: "./icon-32.png",
      vibrate: [200, 100, 200],
      ...options
    };
    self.registration.showNotification(title || "Padre Burgos RHU", finalOptions);
  }
});
