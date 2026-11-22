import {registerSW} from 'virtual:pwa-register';

// Check while the app is open and again when it returns to the foreground.
// autoUpdate activates the new worker and reloads the page after installation.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    const check = () => {
      if (navigator.onLine) void registration.update().catch(() => {
        // A later check will retry after connectivity returns.
      });
    };
    window.setInterval(check, 60_000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
    window.addEventListener('online', check);
    check();
  },
});
