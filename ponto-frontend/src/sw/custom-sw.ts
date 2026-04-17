import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare const self: any;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options: NotificationOptions = {
    body: data.body,
    icon: '/pwa-192x192.svg',
    badge: '/pwa-192x192.svg',
    tag: data.tag || 'lembrete-ponto',
    requireInteraction: true,
    data: data.data || {},
    actions: [
      { action: 'registrar', title: 'Bater Ponto' },
      { action: 'dismiss', title: 'Ignorar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Lembrete de Ponto', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'registrar') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes('localhost') || client.url === '/') {
            client.focus();
            client.navigate('/');
            return;
          }
        }
        return self.clients.openWindow('/');
      })
    );
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-marcacoes') {
    event.waitUntil(sincronizarMarcacoes());
  }
});

async function sincronizarMarcacoes(): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('marcacoes-pendentes', 'readonly');
    const store = tx.objectStore('marcacoes-pendentes');
    const pendentes = await store.getAll();
    
    if (pendentes.length === 0) return;

    const token = await getToken();
    if (!token) return;

    const response = await fetch('http://localhost:3001/api/marcacoes/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ marcacoes: pendentes })
    });

    if (response.ok) {
      const db2 = await openDatabase();
      const tx2 = db2.transaction('marcacoes-pendentes', 'readwrite');
      const store2 = tx2.objectStore('marcacoes-pendentes');
      for (const item of pendentes) {
        await store2.delete(item.id);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ponto-offline-db', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getToken(): Promise<string | null> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('auth-cache', 'readonly');
    const store = tx.objectStore('auth-cache');
    const result = await new Promise<{ accessToken?: string } | undefined>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result[0]);
      request.onerror = () => reject(request.error);
    });
    return result?.accessToken || null;
  } catch {
    return null;
  }
}

registerRoute(
  /^http:\/\/localhost:3001\/api\//,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  }),
  'GET'
);

registerRoute(
  /^http:\/\/localhost:3001\/api\//,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  }),
  'POST'
);
