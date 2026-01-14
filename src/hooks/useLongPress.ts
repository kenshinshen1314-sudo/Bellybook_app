import { useRef, useCallback, useEffect } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  threshold?: number; // Time in ms to trigger long press
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
}

/**
 * Hook for handling long press gestures
 * Useful for showing context menus or delete options
 */
export function useLongPress(options: UseLongPressOptions) {
  const { onLongPress, threshold = 500, onStart, onFinish, onCancel } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPressedRef = useRef(false);
  const hasTriggeredRef = useRef(false);

  const start = useCallback(() => {
    isPressedRef.current = true;
    hasTriggeredRef.current = false;
    onStart?.();

    timeoutRef.current = setTimeout(() => {
      if (isPressedRef.current && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onLongPress();
      }
    }, threshold);
  }, [onLongPress, threshold, onStart]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isPressedRef.current && !hasTriggeredRef.current) {
      onCancel?.();
    } else if (hasTriggeredRef.current) {
      onFinish?.();
    }

    isPressedRef.current = false;
  }, [onCancel, onFinish]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getProps = useCallback(
    () => ({
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        start();
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        cancel();
      },
      onMouseDown: (e: React.MouseEvent) => {
        start();
      },
      onMouseUp: (e: React.MouseEvent) => {
        cancel();
      },
      onMouseLeave: () => {
        cancel();
      },
    }),
    [start, cancel]
  );

  return { getProps, isPressed: isPressedRef.current };
}

/**
 * Hook specifically for delete on long press
 * Shows a visual indicator during long press
 */
export function useLongPressDelete(options: {
  onDelete: () => void;
  threshold?: number;
  onProgress?: (progress: number) => void; // Progress from 0 to 1
}) {
  const { onDelete, threshold = 500, onProgress } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);
  const isPressedRef = useRef(false);

  const start = useCallback(() => {
    isPressedRef.current = true;
    progressRef.current = 0;

    const updateInterval = 20; // Update every 20ms
    const totalSteps = threshold / updateInterval;

    intervalRef.current = setInterval(() => {
      if (progressRef.current < 1) {
        progressRef.current += 1 / totalSteps;
        onProgress?.(Math.min(progressRef.current, 1));
      } else {
        // Long press threshold reached
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onDelete();
      }
    }, updateInterval);
  }, [onDelete, threshold, onProgress]);

  const cancel = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    progressRef.current = 0;
    isPressedRef.current = false;
    onProgress?.(0);
  }, [onProgress]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getProps = useCallback(
    () => ({
      onTouchStart: (e: React.TouchEvent) => {
        // Don't prevent default to allow click through
        start();
      },
      onTouchEnd: () => {
        cancel();
      },
      onTouchCancel: () => {
        cancel();
      },
      onMouseDown: () => {
        start();
      },
      onMouseUp: () => {
        cancel();
      },
      onMouseLeave: () => {
        cancel();
      },
    }),
    [start, cancel]
  );

  return { getProps, progress: progressRef.current };
}
