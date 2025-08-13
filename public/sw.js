const CACHE_NAME = "emergency-reference-v1"
const STATIC_CACHE = "emergency-reference-static-v1"
const DYNAMIC_CACHE = "emergency-reference-dynamic-v1"

// Critical resources to cache immediately
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/data/emergencyConditions.json",
  // Add other critical assets
]

// Install event - cache critical resources
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("Service Worker: Skip waiting")
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Claiming clients")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith("http")) return

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log("Service Worker: Serving from cache", event.request.url)
        return cachedResponse
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache the response for future use
          caches.open(DYNAMIC_CACHE).then((cache) => {
            console.log("Service Worker: Caching new resource", event.request.url)
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If both cache and network fail, show offline page for navigation requests
          if (event.request.destination === "document") {
            return caches.match("/")
          }

          // For other requests, return a generic offline response
          return new Response("Offline - Content not available", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          })
        })
    }),
  )
})

// Background sync for when connection is restored
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag)

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Perform any background sync tasks here
      console.log("Service Worker: Performing background sync"),
    )
  }
})

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received")

  const options = {
    body: event.data ? event.data.text() : "New emergency update available",
    icon: "/medical-emergency-icon.png",
    badge: "/medical-badge-icon.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Update",
        icon: "/view-icon.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/close-icon.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Emergency Reference Update", options))
})
