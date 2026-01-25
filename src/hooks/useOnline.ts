import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';

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
      logger.info('[useOnline]', 'Network status: online');
      setIsOnline(true);
    };

    // Handle offline event
    const handleOffline = () => {
      logger.info('[useOnline]', 'Network status: offline');
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
