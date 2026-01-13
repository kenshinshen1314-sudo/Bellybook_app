import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline status
 * @returns boolean - true if online, false if offline
 */
export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Handle online event
    const handleOnline = () => {
      console.log('[useOnline] Network status: online');
      setIsOnline(true);
    };

    // Handle offline event
    const handleOffline = () => {
      console.log('[useOnline] Network status: offline');
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
