/* ============================================================================
   Miidear — sw.js
   Offline support + installability. Precaches the multi-page shell, serves
   pages network-first (so edits show up) and assets cache-first. Bump
   CACHE_VERSION whenever you change cached files to push an update.
   All paths are root-relative to match a flat repository (all files in root).
   ========================================================================== */
const CACHE_VERSION = 'miidear-v63';

const PRECACHE = [
  './',
  './index.html',
  './portfolio.html',
  './experience.html',
  './contact.html',
  './faq.html',
  './booking.html',
  './admin.html',
  './dashboard.html',
  './style.css',
  './main.js',
  './motion.js',
  './lightbox.js',
  './booking.js',
  './admin.js',
  './dashboard.js',
  './carousel.js',
  './content.js',
  './emailjs.js',
  './hero-poster.jpg',
  './supabase-client.js',
  './manifest.json',
  './favicon.svg',
  './miidear-logo.png',
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
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
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
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  if (!sameOrigin) return; // let cross-origin (Google Fonts) pass through

  // Credentials/config must never be served stale — always network-first so a
  // changed Supabase key/URL takes effect immediately (cache only as offline
  // fallback). This prevents an old config.js from masking a new key.
  const url = new URL(req.url);

  // Mii51: media bypasses the worker entirely — no respondWith, so the browser
  // fetches it natively. Two reasons, both of which the cache-first branch below
  // would otherwise cause now that the hero film is served same-origin:
  //   1. Video is requested with Range headers. Answering a range request from
  //      a cached full 200 body breaks seeking.
  //   2. The hero film is ~13MB. Cache-first would park it in every visitor's
  //      Cache Storage and re-download it on each CACHE_VERSION bump, since
  //      activate deletes the previous cache.
  if (req.headers.has('range') ||
      req.destination === 'video' ||
      req.destination === 'audio' ||
      /\.(mp4|webm|mov|m4v|ogv|mp3|wav)$/i.test(url.pathname)) {
    return;
  }

  if (/\/(config|supabase-client)\.js$/.test(url.pathname)) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Assets: cache-first, refresh in background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
