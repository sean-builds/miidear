/* ============================================================================
   Miidear — sw.js
   Offline support + installability. Precaches the multi-page shell, serves
   pages network-first (so edits show up) and assets cache-first. Bump
   CACHE_VERSION whenever you change cached files to push an update.
   All paths are root-relative to match a flat repository (all files in root).
   ========================================================================== */
const CACHE_VERSION = 'miidear-v3';

const PRECACHE = [
  './',
  './index.html',
  './portfolio.html',
  './experience.html',
  './contact.html',
  './faq.html',
  './booking.html',
  './admin.html',
  './style.css',
  './refinements.css',
  './studies.js',
  './main.js',
  './lightbox.js',
  './booking.js',
  './admin.js',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('miidear-') && k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;

  // Pages: network-first with offline fallback.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (!res.ok) return res;
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  if (!sameOrigin) return; // let cross-origin (Google Fonts) pass through

  // Assets: cache-first, refresh in background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) {
          if (!res.ok) return res;
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
