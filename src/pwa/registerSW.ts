// vite-plugin-pwa registers the service worker via virtual:pwa-register.
// Importing this file from main.tsx is optional — autoUpdate handles updates.
import { registerSW } from 'virtual:pwa-register';

export const updateSW = registerSW({
  onNeedRefresh() {
    // Placeholder: could surface a toast prompting refresh.
  },
  onOfflineReady() {
    // Placeholder: could surface a toast that offline mode is ready.
  },
});
