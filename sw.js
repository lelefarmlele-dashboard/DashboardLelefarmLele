/* Service worker: halaman tetap bisa dibuka tanpa internet setelah pernah dimuat.
   Strategi jaringan dulu, jadi pembaruan aplikasi tetap langsung terlihat saat online. */
const V = "keuangan-v14";
const PRE = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(PRE).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  if (u.origin !== location.origin && u.hostname !== "cdnjs.cloudflare.com") return; /* Firebase dan Telegram tidak disentuh */
  e.respondWith(
    fetch(r).then(res => {
      if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("./") : undefined)))
  );
});
