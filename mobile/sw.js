// Service Worker para COOP-SMART Móvil
const CACHE_NAME = 'coop-smart-mobile-v1';
const urlsToCache = [
    '/mobile/',
    '/mobile/index.html',
    '/mobile/css/app.css',
    '/mobile/js/app.js',
    '/mobile/js/api.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Error al cachear:', err);
            })
    );
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Estrategia de cache: Network First, luego Cache
self.addEventListener('fetch', event => {
    // No cachear llamadas a la API
    if (event.request.url.includes('/api/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clonar la respuesta
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
