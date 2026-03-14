const CACHE_NAME = 'inventario-v1.3'; // Nueva versión con Sistema de Backup
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-512.png',
  'https://cdn.tailwindcss.com'
];

// Instalación: Cachear archivos base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cacheando archivos principales...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación: Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando cache antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia de Cache: Network First
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
