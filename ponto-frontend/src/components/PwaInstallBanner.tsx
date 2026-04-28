import React, { useState, useEffect } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';

export const PwaInstallBanner: React.FC = () => {
  const { isInstallable, install } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pwaInstallDismissed');
    if (stored) {
      const dismissedTime = parseInt(stored);
      const now = Date.now();
      if (now - dismissedTime < 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }
  }, []);

  if (!isInstallable || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
    setDismissed(true);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-green-600 text-white p-3 z-50 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📱</span>
          <span className="text-sm font-medium">Instalar App no dispositivo</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={install}
            className="bg-white text-green-600 px-3 py-1 rounded text-sm font-medium"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/80 px-2 text-lg"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};