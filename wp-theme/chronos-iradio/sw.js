// Service Worker — Chronos iRadio
// Estrategia por tipo de recurso:
//   - manifest.json → SIEMPRE network (el browser lo lee al instalar; un cache
//     stale hace que Brave/Chrome genere WebAPK con iconos viejos y que
//     start_url quede desactualizado)
//   - HTML/CSS/JS  → network-first (para recibir deploys nuevos al instante)
//   - /assets/**   → stale-while-revalidate (rápido + actualiza background)
//   - cross-origin (stream/widget/fonts) → passthrough, no se toca

const VERSION = 'chronos-iradio-v1.5.0';
const SHELL = [
    './',
    './index.html',
    './player.html',
    './styles.css',
    './app.js',
    './assets/logo/chronos-192.png',
    './assets/logo/chronos-512.png',
    './assets/logo/chronos-1024.png',
    './assets/logo/chronos-maskable.png',
    './assets/logo/chronos-maskable-1024.png',
    './assets/hero/banner-chronos.jpeg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(VERSION)
            .then((cache) => cache.addAll(SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

function cachePut(req, res) {
    if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(VERSION).then((cache) => cache.put(req, copy));
    }
    return res;
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    // Cross-origin: dejar pasar al browser (stream, widget ORB, fonts)
    if (url.origin !== self.location.origin) return;

    // Manifest y favicon: siempre network (crítico para install)
    if (url.pathname.endsWith('/manifest.json') || url.pathname.endsWith('/manifest.webmanifest')) {
        event.respondWith(fetch(req).catch(() => caches.match(req)));
        return;
    }

    // HTML/CSS/JS: network-first para recibir deploys nuevos
    const isCritical = req.mode === 'navigate'
        || req.destination === 'document'
        || url.pathname.endsWith('.js')
        || url.pathname.endsWith('.css');
    if (isCritical) {
        event.respondWith(
            fetch(req).then((res) => cachePut(req, res))
                .catch(() => caches.match(req).then((r) => {
                    if (r) return r;
                    // Fallback offline: si pedían player.html, dale player.html
                    const isPlayer = url.pathname.endsWith('/player.html');
                    return caches.match(isPlayer ? './player.html' : './index.html');
                }))
        );
        return;
    }

    // Assets (imágenes, etc): stale-while-revalidate
    event.respondWith(
        caches.match(req).then((cached) => {
            const fresh = fetch(req).then((res) => cachePut(req, res)).catch(() => cached);
            return cached || fresh;
        })
    );
});
