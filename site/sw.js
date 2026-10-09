/*
 * Service worker - Koaksiyel Kablo Veritabanı.
 *
 * Strateji: ağ öncelikli, önbellek yedekli. Çevrimiçiyken her dosya ağdan gelir (güncel sürüm; tarayıcının
 * ES modüllerini eski sürümde tutması sorunu yaşanmaz) ve önbelleğe yazılır. Çevrimdışıyken önbellekten açılır;
 * kurulumda bütün site önceden önbelleğe alınır, böylece ilk ziyaretten sonra sahada internetsiz de çalışır.
 *
 * PRECACHE listesi değişirse CACHE_VERSION'ı artırın.
 */
const CACHE_VERSION = "v6";
const CACHE_NAME = `coax-db-${CACHE_VERSION}`;

const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/app.css",
  "./js/app.js",
  "./js/i18n.js",
  "./js/coax.js",
  "./js/util.js",
  "./js/chart.js",
  "./js/cableart.js",
  "./js/datatr.js",
  "./js/pages/popular.js",
  "./js/pages/calc.js",
  "./js/pages/compare.js",
  "./js/pages/all.js",
  "./js/pages/cable.js",
  "./js/pages/method.js",
  "./data/cables.min.json",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("coax-db-") && k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // dış bağlantılar (datasheet adresleri) karışmasın

  const key = req.mode === "navigate" ? "./index.html" : req;
  e.respondWith(
    fetch(req, { cache: "no-cache" })
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(key, copy));
        }
        return res;
      })
      .catch(() => caches.match(key, { ignoreSearch: true }))
  );
});
