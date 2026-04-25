const CACHE_NAME = 'music-player-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Only cache core assets
      return cache.addAll(['/', '/index.html']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Skip Service Worker for Vite dev/HMR requests completely
  if (
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/__vite') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.includes('hot-update') ||
    url.pathname.includes('?t=') // Vite timestamped requests
  ) {
    return; // Let browser handle it directly
  }

  // 2. Handle API requests (network only)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 3. Handle Audio requests (Cache-first with network fallback)
  if (url.pathname.includes('/uploads/audio/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;
        
        return fetch(event.request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Default: Network-first for everything else
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip service worker for Vite HMR and dev requests
  if (url.pathname.startsWith('/@vite') || url.pathname.startsWith('/__vite') || url.pathname.includes('hot-update')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('[SW] Cache hit:', event.request.url);
        return response;
      }
      
      console.log('[SW] Fetching from network:', event.request.url);
      return fetch(event.request).then((networkResponse) => {
        // Only cache if valid audio/track request
        if (event.request.url.includes('/uploads/audio/')) {
          console.log('[SW] Caching audio:', event.request.url);
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.error('[SW] Fetch failed:', event.request.url, err);
        throw err;
      });
    })
  );
});
