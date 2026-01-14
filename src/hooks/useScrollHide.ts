import { useState, useEffect } from 'react';

interface UseScrollHideOptions {
  threshold?: number; // Scroll distance to trigger hide
  hideDelay?: number; // Delay in ms before hiding
  debounceMs?: number; // Debounce scroll events
}

/**
 * Hook for hiding navigation bar on scroll down, showing on scroll up
 */
export function useScrollHide(options: UseScrollHideOptions = {}) {
  const { threshold = 50, hideDelay = 100, debounceMs = 50 } = options;
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Debounce scroll handling
      timeoutId = setTimeout(() => {
        // Calculate scroll direction
        const scrollDirection = currentScrollY - lastScrollY;

        // Hide nav when scrolling down past threshold
        if (scrollDirection > threshold && currentScrollY > 100) {
          setIsHidden(true);
        }
        // Show nav when scrolling up
        else if (scrollDirection < -threshold / 2) {
          setIsHidden(false);
        }

        setLastScrollY(currentScrollY);
      }, debounceMs);

      setScrollTimeout(timeoutId);
    };

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [lastScrollY, threshold, debounceMs, scrollTimeout]);

  return { isHidden, setIsHidden };
}

/**
 * Hook for hiding bottom tab bar on scroll
 * Similar to useScrollHide but specifically for bottom navigation
 */
export function useTabBarHide(options: UseScrollHideOptions = {}) {
  const { threshold = 30, hideDelay = 150 } = options;
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let isScrollingDown = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY - lastScrollY;

      // Detect scroll direction
      if (Math.abs(scrollDirection) > 5) {
        isScrollingDown = scrollDirection > 0;
      }

      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout to hide/show after scroll stops
      timeoutId = setTimeout(() => {
        if (isScrollingDown && currentScrollY > 100) {
          setIsHidden(true);
        } else if (!isScrollingDown || currentScrollY < 50) {
          setIsHidden(false);
        }

        setLastScrollY(currentScrollY);
      }, hideDelay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [lastScrollY, threshold, hideDelay]);

  return { isHidden };
}
