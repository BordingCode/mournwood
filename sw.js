/* Mournwood service worker — offline-first app shell. Bump CACHE on release. */
const CACHE = 'mournwood-v1';
const SHELL = [
  './',
  'index.html',
  'manifest.json',
  'css/main.css',
  'js/main.js',
  'js/rng.js',
  'js/ui.js',
  'js/state.js',
  'js/data/classes.js',
  'js/data/races.js',
  'js/vendor/gsap.min.js',
  'js/vendor/howler.min.js',
  'js/vendor/idb-keyval.js',
  'icons/favicon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first for same-origin GET; fall back to network and cache it; offline-safe.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match('index.html'));
    })
  );
});
