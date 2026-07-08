const CACHE_NAME = 'deryid-v1';
const urlsToCache = [
  '/',
  '/deryid-pwa.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Firebase requests — always use network
  if(event.request.url.includes('firebaseapp.com') || 
     event.request.url.includes('googleapis.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response('Offline')));
    return;
  }

  // Other requests — cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/deryid-pwa.html'))
  );
});

self.addEventListener('sync', event => {
  if(event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // This will be called when connection is restored
  console.log('Syncing offline data...');
}
