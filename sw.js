// ============================================================
//  sw.js  —  Tokyo 2026 PWA Service Worker
//  部署位置：與 index.html 同層（根目錄）
// ============================================================

const CACHE_NAME = 'tokyo-2026-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './index22.html',
];

// ── Install：預先快取所有指定資源 ──
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Pre-caching:', PRECACHE_URLS);
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// ── Activate：清除舊版快取 ──
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── Fetch：Cache First（離線優先） ──
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) {
        const fetchPromise = fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(function() {});

        return cached;
      }

      return fetch(event.request).then(function(networkResponse) {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      }).catch(function() {
        return new Response('目前離線，請稍後再試。', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
