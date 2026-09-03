// Service Worker para Tec Justiça Lite — v1.1
// Estratégia: Network-First (sempre busca versão nova, usa cache como fallback offline)
// Isso garante que atualizações do app sejam aplicadas sem hard refresh e sem crashar no mobile.

const CACHE_NAME = 'tec-justica-v1.1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

// INSTALL: pré-carrega apenas o shell mínimo do app
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }).then(() => {
      // Ativa imediatamente sem esperar a aba ser fechada
      return self.skipWaiting();
    })
  );
});

// ACTIVATE: apaga caches de versões anteriores e toma controle de todas as abas abertas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // Assume o controle imediato de todas as páginas abertas
      return self.clients.claim();
    })
  );
});

// FETCH: Network-First para todos os recursos do app
// - Chamadas de API: sempre rede, sem cache
// - Recursos do app (JS/CSS/HTML): tenta rede primeiro, cache como fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: sempre vai para a rede, nunca cacheia
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'offline', offline: true }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Ignora requisições cross-origin (Google Fonts, CDNs, etc.)
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  // NETWORK-FIRST para todos os recursos do app:
  // Tenta buscar da rede sempre; se falhar (offline), cai para o cache.
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Atualiza o cache com a resposta mais recente da rede
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Rede falhou (offline): tenta o cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback para index.html em navegações (SPA offline)
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Mensagem para o app: notifica quando o SW foi atualizado
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
