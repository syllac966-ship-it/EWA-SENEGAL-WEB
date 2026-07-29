export function registerServiceWorker() {
  // Uniquement en production : en dev, un SW mis en cache entre en conflit
  // avec le rechargement à chaud (HMR) de Vite.
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Échec de l'enregistrement du service worker :", err);
    });
  });
}
