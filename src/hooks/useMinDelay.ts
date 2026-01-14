import { useState, useEffect, useRef } from 'react';

/**
 * Hook to ensure a minimum delay before showing loaded content
 * This prevents skeleton screens from flashing for very fast loads
 *
 * @param isLoading - The actual loading state
 * @param minDelay - Minimum delay in ms (default: 300ms)
 * @returns showSkeleton - Whether to show skeleton (true if within minDelay)
 *
 * @example
 * const { showSkeleton, hasElapsedMinDelay } = useMinDelay(isLoading, 300);
 *
 * if (showSkeleton) {
 *   return <Skeleton />;
 * }
 * return <ActualContent />;
 */
export function useMinDelay(
  isLoading: boolean,
  minDelay: number = 300
): { showSkeleton: boolean; hasElapsedMinDelay: boolean } {
  const [hasElapsedMinDelay, setHasElapsedMinDelay] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    // Set timeout to mark minimum delay as elapsed
    timeoutRef.current = setTimeout(() => {
      setHasElapsedMinDelay(true);
    }, minDelay);

    // Cleanup timeout on unmount or when loading completes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [minDelay]);

  useEffect(() => {
    // If loading completes before minimum delay, still wait for the delay
    // If loading completes after minimum delay, show content immediately
    if (!isLoading) {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingDelay = minDelay - elapsed;

      if (remainingDelay > 0) {
        // Loading completed quickly, still wait for minimum delay
        // This prevents skeleton from flashing
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setHasElapsedMinDelay(true);
        }, remainingDelay);
      } else {
        // Minimum delay already elapsed, show content immediately
        setHasElapsedMinDelay(true);
      }
    }
  }, [isLoading, minDelay]);

  // Show skeleton if still loading OR if minimum delay hasn't elapsed yet
  const showSkeleton = isLoading || !hasElapsedMinDelay;

  return { showSkeleton, hasElapsedMinDelay };
}

/**
 * Simpler version that returns a boolean
 * Use this when you only need to know if skeleton should be shown
 */
export function useShowSkeleton(isLoading: boolean, minDelay: number = 300): boolean {
  return useMinDelay(isLoading, minDelay).showSkeleton;
}

/**
 * Hook to track loading start time for analytics
 */
export function useLoadingTimer() {
  const startTimeRef = useRef<number>(Date.now());

  const getElapsed = () => Date.now() - startTimeRef.current;

  const reset = () => {
    startTimeRef.current = Date.now();
  };

  return { getElapsed, reset };
}
