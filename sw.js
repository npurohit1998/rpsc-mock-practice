// RPSC Mock Practice - Service Worker
// Version: 3.0.0 (Bulletproof Firebase Bypass)

const CACHE_NAME = 'rpsc-mock-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => console.log('Cache error:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // सबसे ज़रूरी लाइन: अगर रिक्वेस्ट Firebase या किसी बाहरी साइट की है, तो उसे आज़ाद छोड़ दो!
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // सिर्फ़ ऐप की लोकल फाइल्स को कैशे करो
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
