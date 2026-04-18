// Service Worker — Chronos iRadio
// Estrategia:
// - Precache del shell (HTML/CSS/JS/manifest/logo)
// - Cache-first para assets versionados en /assets/
// - Network-first para index.html (para recibir deploys nuevos)
// - Ignora el stream de audio y el widget OnlineRadioBox (siempre network)

const VERSION = 'chronos-iradio-v1.1.0';
const SHELL = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './assets/logo/chronos-32.jpg',
    './assets/logo/chronos-180.jpg',
    './assets/logo/chronos-192.jpg',
    './assets/hero/banner-chronos.jpeg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // No cachees nada de orígenes cross-origin (stream de audio, widget, fonts)
    if (url.origin !== self.location.origin) return;

    // Network-first para el documento HTML (para ver deploys frescos)
    if (req.mode === 'navigate' || req.destination === 'document') {
        event.respondWith(
            fetch(req).then((res) => {
                const copy = res.clone();
                caches.open(VERSION).then((cache) => cache.put(req, copy));
                return res;
            }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
        );
        return;
    }

    // Cache-first para el resto (assets)
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                if (res && res.status === 200) {
                    const copy = res.clone();
                    caches.open(VERSION).then((cache) => cache.put(req, copy));
                }
                return res;
            });
        })
    );
});
