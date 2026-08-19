import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-neutral-950 px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-semibold"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
          <span>Working offline. GymFlow will automatically reconnect when your internet is restored.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (navigator.onLine) setIsOffline(false);
            else window.location.reload();
          }}
          className="px-2.5 py-1 bg-neutral-950 text-white rounded-lg hover:bg-neutral-900 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
          Retry Connection
        </button>
      </div>
    </div>
  );
};
