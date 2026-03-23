// ============================================================
//  sw.js  —  Tokyo 2026 PWA Service Worker
//  部署位置：與 index.html 同層（根目錄）
// ============================================================

const CACHE_NAME = 'tokyo-2026-v4';

const PRECACHE_URLS = [
  './',
  './index.html',
  './index22.html',
  // ── img/ ──
  './img/3_28_0900.png',
  './img/4_6_1720_1.png',
  './img/4_6_1720_2.png',
  './img/day_1_airbnb_pdf.png',
  './img/g01_f4481e57a4.png',
  './img/g02_1ba2935666.png',
  './img/g03_b79b5ea740.png',
  './img/g04_03ec62fd36.png',
  './img/g05_1a1557c0e4.png',
  './img/g05_1a1557c0e4.webp',
  './img/g06_3cd6b440b5.jpg',
  './img/g07_f8ddaf6174.jpg',
  './img/g08_3e0400ec4d.jpg',
  './img/g09_3bd4270814.jpg',
  './img/g09_3bd4270814.png',
  './img/g10_2b6d34411e.jpg',
  './img/g10_2b6d34411e.png',
  './img/g11_8d5e3dc066.jpg',
  './img/g11_8d5e3dc066.png',
  './img/g12_c8e8236875.jpg',
  './img/g12_c8e8236875.png',
  './img/g13_ea02941ecf.jpg',
  './img/g13_ea02941ecf.png',
  './img/g14_13e11c48db.jpg',
  './img/g14_13e11c48db.png',
  './img/g15_c0efbdd0c2.jpg',
  './img/g15_c0efbdd0c2.png',
  './img/g16_b863ffd46a.jpg',
  './img/g16_b863ffd46a.png',
  './img/g17_8238d50fd5.jpg',
  './img/g17_8238d50fd5.png',
  './img/g18_294043add8.jpg',
  './img/g18_294043add8.png',
  './img/g19_db48722a0f.jpg',
  './img/g19_db48722a0f.png',
  './img/g20_c6e794a1c7.jpg',
  './img/g20_c6e794a1c7.png',
  './img/g21_2b82224f1f.jpg',
  './img/g21_2b82224f1f.png',
  './img/g22_84d3474354.jpg',
  './img/g22_84d3474354.png',
  './img/g37_94f2ec8f45.png',
  './img/img_01_344c9ec4.png',
  './img/img_02_20d0eda3.png',
  './img/img_03_2173dc74.png',
  './img/img_04_09426029.png',
  './img/img_05_c4165b1f.png',
  './img/img_06_4b5f765f.jpg',
  './img/img_07_47d53cf1.jpg',
  './img/img_08_85328b09.jpg',
  './img/img_37_5f4e8cc0.png',
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
