const V = 'moy-ritm-v5-1';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'core.js', 'tips.js', 'mentor2.js', 'extras.js', 'tastes.js', 'menu.js', 'icons.js', 'friend.js', 'sounds.js', 'survey.js', 'gigachat.js', 'v4.js', 'v5.js', 'details.js', 'widget/Moy_ritm_widget.js', 'friend/wave.webp', 'friend/face-wave.webp', 'friend/think.webp', 'friend/face-think.webp', 'friend/cheer.webp', 'friend/face-cheer.webp', 'friend/wow.webp', 'friend/face-wow.webp', 'friend/angry.webp', 'friend/face-angry.webp', 'friend/shrug.webp', 'friend/face-shrug.webp', 'friend/shy.webp', 'friend/face-shy.webp', 'friend/thumbs.webp', 'friend/face-thumbs.webp', 'config.json', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== 'moy-meta').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Сначала сеть (чтобы изменения подхватывались), без сети берём из памяти
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const copy = r.clone();
      caches.open(V).then((c) => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request).then((m) => m || caches.match('index.html')))
  );
});

self.addEventListener('push', (e) => {
  let d = { title: 'Мой ритм', body: '' };
  try { d = { ...d, ...e.data.json() }; } catch (err) { if (e.data) d.body = e.data.text(); }
  e.waitUntil(Promise.all([self.registration.showNotification(d.title, { body: d.body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: d.tag || 'ritm' }), caches.open('moy-meta').then((c) => c.put('last-push', new Response(String(Date.now())))).catch(() => {})]));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
