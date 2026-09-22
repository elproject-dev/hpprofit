const CACHE_NAME = 'hpprofit-cache-v5';

// Semua halaman HTML app
const APP_PAGES = [
  '/',
  '/bahan-baku',
  '/packaging',
  '/produk',
  '/biaya-tambahan',
  '/transaksi-produksi',
  '/pengaturan',
  '/bantuan',
  '/admin-voucher',
];

// Semua JS/CSS chunks Next.js yang dibutuhkan untuk routing offline
// (di-generate saat build, perlu diperbarui setiap build baru)
const NEXT_STATIC_ASSETS = [
  '/_next/static/chunks/00w7inso5aayf.js',
  '/_next/static/chunks/03wn9-sq3r90k.js',
  '/_next/static/chunks/09lm-6i18mu20.js',
  '/_next/static/chunks/0cz1d0mv5g_q7.js',
  '/_next/static/chunks/0hckbr58igvvj.js',
  '/_next/static/chunks/0_i2f8i38ov7t.js',
  '/_next/static/chunks/0l0zw2yp12ywm.js',
  '/_next/static/chunks/0pfd0q-fjn2o1.js',
  '/_next/static/chunks/0tdtc7xrijnkj.js',
  '/_next/static/chunks/12-6qtjpunf_9.js',
  '/_next/static/chunks/16uf4rmrb90d-.js',
  '/_next/static/chunks/1_aayg5lt402u.js',
  '/_next/static/chunks/1ffthfi2hzxom.js',
  '/_next/static/chunks/1q34ja9ja8h05.js',
  '/_next/static/chunks/1rf9q-rrdi0_k.js',
  '/_next/static/chunks/1_wztng53umwm.css',
  '/_next/static/chunks/25cn4ylri6hh4.js',
  '/_next/static/chunks/2_c--6r36m-8y.js',
  '/_next/static/chunks/2f9u_t7ew65bz.js',
  '/_next/static/chunks/2wcm0c_zku7gi.js',
  '/_next/static/chunks/2y9li0ra_tv_d.css',
  '/_next/static/chunks/3_5x_zgqgi8qb.js',
  '/_next/static/chunks/394r3c445w2o6.js',
  '/_next/static/chunks/3grxeik_oudwt.js',
  '/_next/static/chunks/3h29w7wf4kkdf.js',
  '/_next/static/chunks/3stgibsvzuzg7.js',
  '/_next/static/chunks/turbopack-3-kuin_gmfy7g.js',
  '/_next/static/GISnW2MyLdSEsIaaCi7ho/_buildManifest.js',
  '/_next/static/GISnW2MyLdSEsIaaCi7ho/_clientMiddlewareManifest.js',
  '/_next/static/GISnW2MyLdSEsIaaCi7ho/_ssgManifest.js',
];

// Aset statis lainnya
const OTHER_ASSETS = [
  '/manifest.json',
  '/icon.svg',
  '/favicon.ico',
];

// Fungsi helper: cache satu URL, tangani error per-item
async function cacheUrl(cache, url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
      await cache.put(url, response);
    }
  } catch {
    // Abaikan jika gagal saat install (misal sedang offline)
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache semua aset serentak
      const allUrls = [...OTHER_ASSETS, ...NEXT_STATIC_ASSETS, ...APP_PAGES];
      await Promise.all(allUrls.map((url) => cacheUrl(cache, url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip: cross-origin, API, extensions, and non-GET requests (like HEAD, POST)
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api') ||
    request.url.startsWith('chrome-extension')
  ) {
    return;
  }

  // Skip: Next.js HMR / dev endpoints (development only, tidak ada di production)
  if (
    url.pathname.includes('webpack-hmr') ||
    url.pathname.includes('__nextjs') ||
    url.pathname.includes('on-demand-entries')
  ) {
    return;
  }

  // ─── Navigasi Halaman HTML ─────────────────────────────────────────────────
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Online: simpan ke cache
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Offline: cari di cache dengan beberapa variasi URL
          const pathname = url.pathname;

          // 1. Coba exact match
          const exact = await caches.match(request);
          if (exact) return exact;

          // 2. Coba tanpa trailing slash
          const noSlash = pathname.endsWith('/')
            ? await caches.match(pathname.slice(0, -1))
            : null;
          if (noSlash) return noSlash;

          // 3. Coba dengan trailing slash
          const withSlash = !pathname.endsWith('/')
            ? await caches.match(pathname + '/')
            : null;
          if (withSlash) return withSlash;

          // 4. Fallback: kembalikan root shell (URL tetap tidak berubah)
          const rootShell = await caches.match('/');
          if (rootShell) return rootShell;

          // 5. Tidak ada cache sama sekali
          return new Response(
            `<html><body style="font-family:sans-serif;text-align:center;padding:40px">
              <h2>Sedang Offline</h2>
              <p>Halaman ini belum tersedia offline.<br>Buka dulu saat terkoneksi internet.</p>
              <a href="/">Kembali ke Dashboard</a>
            </body></html>`,
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // ─── Aset Next.js Static (JS/CSS/Font) — Cache-first ─────────────────────
  // Aset ini punya hash di nama file, aman untuk di-cache permanen
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 408, statusText: 'Offline' }));
      })
    );
    return;
  }

  // ─── Aset Lainnya (images, fonts, dll) — Cache-first ─────────────────────
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => new Response('', { status: 408, statusText: 'Offline' }));
    })
  );
});
