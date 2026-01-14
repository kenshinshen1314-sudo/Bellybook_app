import { useCallback, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';

export interface UseSwipeNavigationOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventScrollOnSwipe?: boolean;
  trackMouse?: boolean;
  trackTouch?: boolean;
}

export interface UseSwipeNavigationResult {
  ref: React.RefObject<HTMLDivElement>;
  handlers: ReturnType<typeof useSwipeable>;
}

/**
 * Hook for managing swipe navigation between tabs
 * Supports both touch and mouse gestures
 */
export function useSwipeNavigation(options: UseSwipeNavigationOptions = {}): UseSwipeNavigationResult {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 30,
    preventScrollOnSwipe = false,
    trackMouse = true,
    trackTouch = true,
  } = options;

  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    onSwipedUp: onSwipeUp,
    onSwipedDown: onSwipeDown,
    touchEventOptions: { passive: true },
    preventScrollOnSwipe,
    trackMouse,
    trackTouch,
    swipeDuration: 250,
    delta: threshold,
  });

  const ref = useRef<HTMLDivElement>(null);

  // Attach handlers to ref
  useEffect(() => {
    if (ref.current) {
      Object.assign(ref.current, handlers);
    }
  }, [handlers]);

  return { ref, handlers };
}

/**
 * Hook specifically for tab navigation with spring animation support
 */
export function useTabSwipeNavigation(options: {
  activeTab: number;
  tabCount: number;
  onTabChange: (tabIndex: number) => void;
  threshold?: number;
}) {
  const { activeTab, tabCount, onTabChange, threshold = 50 } = options;

  const handleSwipeLeft = useCallback(() => {
    // Swipe left = move to next tab
    const nextTab = Math.min(activeTab + 1, tabCount - 1);
    if (nextTab !== activeTab) {
      onTabChange(nextTab);
    }
  }, [activeTab, tabCount, onTabChange]);

  const handleSwipeRight = useCallback(() => {
    // Swipe right = move to previous tab
    const prevTab = Math.max(activeTab - 1, 0);
    if (prevTab !== activeTab) {
      onTabChange(prevTab);
    }
  }, [activeTab, onTabChange]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    touchEventOptions: { passive: true },
    preventScrollOnSwipe: false, // Allow vertical scrolling
    trackMouse: true,
    trackTouch: true,
    swipeDuration: 300,
    delta: threshold,
  });

  return {
    swipeHandlers,
    canSwipeLeft: activeTab < tabCount - 1,
    canSwipeRight: activeTab > 0,
  };
}

/**
 * Spring animation config for tab transitions
 */
export const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
} as const;

/**
 * Variants for tab container with slide animation
 */
export const tabVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

/**
 * Helper to determine slide direction based on tab change
 */
export function getSlideDirection(fromTab: number, toTab: number): number {
  return toTab > fromTab ? 1 : -1;
}
