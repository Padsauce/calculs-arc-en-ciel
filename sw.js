/* Calculs Arc-en-ciel — service worker (v42).
   The network always comes first, so the game keeps loading its newest version (and version.json keeps
   driving the automatic updates). The copies kept here are only used when there is no network:
   the installed app then opens even offline. Old versions (versions/), version.json, Firebase and
   everything else go straight to the network, untouched. */
const CACHE = 'cae-1', FONTS = 'cae-fonts-1';
const CORE = ['./', 'conditions.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
const ROOT = new URL('./', self.registration.scope).pathname;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(CORE.map(u => fetch(u, { cache: 'no-cache' }).then(r => (r.ok ? c.put(u, r) : null)).catch(() => null))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('cae-') && k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// The cache key of a request of the game, or '' when the request is left alone.
function keyOf(url) {
  const u = new URL(url);
  if (u.origin !== location.origin || !u.pathname.startsWith(ROOT)) return '';
  const p = u.pathname.slice(ROOT.length);
  if (p === '' || p === 'index.html') return './';
  return CORE.includes(p) || p === 'buste.js' ? p : '';
}

async function networkFirst(req, key) {
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === 'basic' && !res.redirected) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(key, copy)).catch(() => {});
    }
    return res;
  } catch (err) {
    const hit = await caches.match(key, { cacheName: CACHE });
    if (hit) return hit;
    throw err;
  }
}

// Fonts: the style sheet from the network first, the font files (they never change) from the copy first.
async function fonts(req) {
  const c = await caches.open(FONTS);
  if (new URL(req.url).hostname === 'fonts.gstatic.com') {
    const hit = await c.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()).catch(() => {});
    return res;
  }
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()).catch(() => {});
    return res;
  } catch (err) {
    const hit = await c.match(req);
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const host = new URL(req.url).hostname;
  if (host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com') { e.respondWith(fonts(req)); return; }
  const key = keyOf(req.url);
  if (key) e.respondWith(networkFirst(req, key));
});
