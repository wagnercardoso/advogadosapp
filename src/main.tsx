import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Registro do Service Worker com suporte a atualização automática (v1.1)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Verifica se há um SW esperando (nova versão disponível)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // Nova versão instalada: ativa imediatamente sem pedir ao usuário
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        // Quando o SW ativo muda (nova versão tomou controle), recarrega silenciosamente
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            // Recarrega a página para carregar os novos assets — sem perda de dados
            // (localStorage permanece intacto)
            window.location.reload();
          }
        });
      })
      .catch((err) => {
        console.warn('[SW] Falha no registro:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
