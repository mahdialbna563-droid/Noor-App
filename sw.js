const CACHE = "noor-v1";
const FILES = ["./", "noor.html", "listen.html", "read.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(FILES);
    try { await c.add("quran-data.js"); } catch (err) {}   // اختياري: إن وُجد الملف
  }));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  // لا نخزّن الصوت ولا طلبات المقاطع ولا واجهة المصحف (read.html يخزّنها بنفسه)
  if (r.method !== "GET" || r.headers.has("range") || u.pathname.includes("/audio/") || u.hostname === "api.alquran.cloud") return;
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match("noor.html"))));
});
