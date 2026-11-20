// Piggy Bank service worker: makes the app installable and shows a simple
// page when there's no connection. Data always comes from the network, so
// balances are never stale.
const OFFLINE_HTML = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin conexión</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#121316;color:#e8e8ea;font-family:system-ui,sans-serif;text-align:center;padding:24px}p{color:#9a9ba1}button{margin-top:16px;background:#3ecf8e;color:#0b1a13;border:0;border-radius:999px;padding:10px 20px;font-weight:600}</style></head><body><div><h1>Sin conexión</h1><p>Piggy Bank necesita internet para mostrar tus cuentas.</p><button onclick="location.reload()">Reintentar</button></div></body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(
      () => new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })
    )
  );
});
