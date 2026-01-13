// Bellybook PWA Service Worker
// Version: 1.0.0

const CACHE_NAME = 'bellybook-v1';
const RUNTIME_CACHE = 'bellybook-runtime-v1';

// Core assets to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Assets to cache from build output
const PRECACHE_URLS = [
  '/assets/index-DoqJAYH8.css',
  '/assets/index-DoqJAYH8.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event triggered');

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Caching static assets:', STATIC_CACHE_URLS);
        await cache.addAll(STATIC_CACHE_URLS);

        // Try to cache build assets, but don't fail if they don't exist yet
        try {
          await cache.addAll(PRECACHE_URLS);
          console.log('[SW] Build assets cached successfully');
        } catch (err) {
          console.warn('[SW] Build assets not yet available, will cache on next fetch:', err);
        }

        // Skip waiting to activate new SW immediately
        self.skipWaiting();
        console.log('[SW] Install complete, skipping waiting');
      } catch (error) {
        console.error('[SW] Install failed:', error);
        throw error;
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event triggered');

  event.waitUntil(
    (async () => {
      try {
        // Delete old caches
        const cacheNames = await caches.keys();
        const cachesToDelete = cacheNames.filter(name =>
          name !== CACHE_NAME && name !== RUNTIME_CACHE
        );

        if (cachesToDelete.length > 0) {
          console.log('[SW] Deleting old caches:', cachesToDelete);
          await Promise.all(cachesToDelete.map(name => caches.delete(name)));
        }

        // Take control of all clients immediately
        await self.clients.claim();
        console.log('[SW] Activate complete, claimed all clients');
      } catch (error) {
        console.error('[SW] Activate failed:', error);
        throw error;
      }
    })()
  );
});

// Fetch event - network-first strategy with fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network-first strategy for HTML and API requests
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(request);

          // Cache the fresh response
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, networkResponse.clone());

          return networkResponse;
        } catch (error) {
          console.log('[SW] Network failed, falling back to cache:', request.url);

          // Fallback to cache
          const cachedResponse = await caches.match(request);

          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline page for HTML navigation
          if (request.mode === 'navigate') {
            return caches.match('/index.html') || new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            });
          }

          throw error;
        }
      })()
    );
    return;
  }

  // Cache-first for static assets (CSS, JS, images)
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
          // Update cache in background
          fetch(request).then(networkResponse => {
            cache.put(request, networkResponse);
          });

          return cachedResponse;
        }

        // Not in cache, fetch from network
        try {
          const networkResponse = await fetch(request);

          // Cache successful responses
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          console.error('[SW] Fetch failed for static asset:', request.url);
          throw error;
        }
      })()
    );
    return;
  }

  // Default: network-only for other requests
  event.respondWith(fetch(request));
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(event.data.urls);
      })()
    );
  }
});

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);

  if (event.tag === 'sync-meals') {
    event.waitUntil(
      (async () => {
        // TODO: Implement meal sync logic
        console.log('[SW] Syncing meals...');
      })()
    );
  }
});

// Push event - handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification',
      icon: '/icon-192x192.png',
      badge: '/icon-96x96.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Bellybook', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

console.log('[SW] Service Worker loaded, version:', CACHE_NAME);
