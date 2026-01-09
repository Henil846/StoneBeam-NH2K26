/**
 * Service Worker for StoneBeam-NH
 * Provides offline functionality, background sync, and caching
 */

const CACHE_NAME = 'stonebeam-nh-v1';
const STATIC_CACHE = 'stonebeam-static-v1';
const DYNAMIC_CACHE = 'stonebeam-dynamic-v1';

// Files to cache for offline use
const STATIC_FILES = [
    '/',
    '/index.html',
    '/login.html',
    '/signup.html',
    '/profile.html',
    '/firebase.js',
    '/auth-manager.js',
    '/browser-compatibility.js',
    '/index.css',
    '/login.css',
    '/signup.css',
    '/profile.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                self.skipWaiting();
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_NAME &&
                                cacheName !== STATIC_CACHE &&
                                cacheName !== DYNAMIC_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET requests and external requests
    if (request.method !== 'GET' || url.origin !== self.location.origin) {
        return fetch(request);
    }

    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('Service Worker: Serving from cache:', request.url);
                    return response;
                }

                // Otherwise, fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Cache successful responses
                        if (networkResponse.ok) {
                            console.log('Service Worker: Caching new response:', request.url);
                            caches.open(DYNAMIC_CACHE)
                                .then((cache) => cache.put(request, networkResponse.clone()));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // If network fails, try to serve offline page
                        return caches.match('/offline.html');
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received:', event);

    const options = {
        body: event.data ? event.data.text() : 'New notification from StoneBeam-NH',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: event.data ? event.data.json() : {},
        actions: [
            {
                action: 'open',
                title: 'Open App'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('StoneBeam-NH', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked:', event);

    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else {
        event.waitUntil(
            clients.matchAll().then((clientList) => {
                for (const client of clientList) {
                    if (client.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Background sync function
async function doBackgroundSync() {
    try {
        // Sync offline data
        const offlineData = await getOfflineData();

        for (const data of offlineData) {
            try {
                await syncToServer(data);
                await removeOfflineData(data.id);
            } catch (error) {
                console.error('Sync failed for:', data, error);
            }
        }

        console.log('Background sync completed');
    } catch (error) {
        console.error('Background sync error:', error);
    }
}

// Get offline data from IndexedDB
async function getOfflineData() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('stonebeam-offline', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['actions'], 'readonly');
            const store = transaction.objectStore('actions');
            const getAllRequest = store.getAll();

            getAllRequest.onerror = () => reject(getAllRequest.error);
            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        };
    });
}

// Remove synced offline data
async function removeOfflineData(id) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('stonebeam-offline', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['actions'], 'readwrite');
            const store = transaction.objectStore('actions');
            const deleteRequest = store.delete(id);

            deleteRequest.onerror = () => reject(deleteRequest.error);
            deleteRequest.onsuccess = () => resolve();
        };
    });
}

// Sync data to server
async function syncToServer(data) {
    const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
    }

    return response.json();
}

// IndexedDB setup for offline storage
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then((cache) => cache.addAll(event.data.urls))
        );
    }
});
