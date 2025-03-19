const CACHE_NAME = 'budgetin-cache-v1';

// URLs to cache - key assets only
const urlsToCache = [
  './',
  './index.html',
  './css/main.css',
  './css/layout.css',
  './css/components.css',
  './css/forms.css',
  './js/app.js',
  './manifest.json',
  './icons/budgetin-icon.svg'
];

// Install event - cache basic assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.error(`Failed to cache ${url}: ${error}`);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Simplified fetch handler - only cache assets from our origin
self.addEventListener('fetch', event => {
  // Only handle GET requests from our origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Network-first strategy for dynamic content
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // If network fails, try cache as fallback
        return caches.match(event.request);
      })
  );
}); 