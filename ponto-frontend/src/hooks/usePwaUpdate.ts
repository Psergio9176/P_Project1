import { useState, useEffect } from 'react';

export function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          if (registration.waiting) {
            setUpdateAvailable(true);
          }
        }
      }
    };

    const interval = setInterval(checkUpdate, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const applyUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage('skip-waiting');
      }
    }
    window.location.reload();
  };

  return { updateAvailable, applyUpdate };
}