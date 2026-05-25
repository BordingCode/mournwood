/* Mournwood service worker — network-first (fresh code online, full offline fallback). */
const CACHE = 'mournwood-v3';
const SHELL = [
  './',
  'index.html',
  'manifest.json',
  'css/main.css',
  'css/combat.css',
  'css/map.css',
  'js/main.js',
  'js/run.js',
  'js/save.js',
  'js/settings.js',
  'js/art.js',
  'js/icons.js',
  'assets/manifest.json',
  'js/screens/map.js',
  'js/screens/hub.js',
  'js/screens/nodes.js',
  'js/screens/saves.js',
  'js/screens/qol.js',
  'js/rng.js',
  'js/ui.js',
  'js/state.js',
  'js/audio.js',
  'js/fx.js',
  'js/statuses.js',
  'js/cards.js',
  'js/enemies.js',
  'js/relics.js',
  'js/potions.js',
  'js/combat.js',
  'js/screens/combat.js',
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

// Network-first for same-origin GET: always try fresh, cache the result, and fall
// back to cache (then index.html) when offline. Cross-origin requests pass through.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
  );
});
