const CACHE_NAME = 'hpprofit-cache-v3';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip cross-origin requests, API calls, Next.js internals (HMR), and extensions
  if (
    !url.origin.includes(self.location.origin) ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.includes('hmr') ||
    request.url.startsWith('chrome-extension')
  ) {
    return;
  }

  // Network-first for HTML pages (so we get latest build if online)
  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            if (response) return response;
            return caches.match('/'); // Fallback to root
          });
        })
    );
    return;
  }

  // Cache-first for static assets (images, CSS, JS, fonts)
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for failed requests if needed
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});
