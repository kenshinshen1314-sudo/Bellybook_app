import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Language } from '@/types';
import { logger } from '@/utils/logger';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  language: Language;
  threshold?: number; // Distance in pixels to trigger refresh
  backgroundColor?: string;
}

/**
 * PullToRefresh Component - Adds pull-to-refresh functionality
 * Works with vertical scrolling and swipe gestures
 */
export function PullToRefresh({
  onRefresh,
  children,
  language,
  threshold = 80,
  backgroundColor = 'transparent',
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const isDragging = useRef(false);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only enable pull-to-refresh when at the top of the page
    if (window.scrollY <= 0) {
      setTouchStart(e.touches[0].clientY);
      isDragging.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStart;

    // Only show pull indicator when pulling down and at top of page
    if (diff > 0 && window.scrollY <= 0) {
      // Apply resistance (diminishing returns)
      const resistance = 0.4;
      const distance = Math.min(diff * resistance, threshold * 1.5);
      setPullDistance(distance);
    }
  }, [touchStart, threshold, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current || isRefreshing) return;

    isDragging.current = false;

    // Trigger refresh if pulled past threshold
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } catch (err) {
        logger.error('Error during refresh:', err);
      } finally {
        // Reset after a short delay to show completion
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      // Reset if not pulled far enough
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  // Calculate progress (0 to 1)
  const progress = Math.min(pullDistance / threshold, 1);

  // Rotation angle for refresh icon
  const rotation = progress * 360;

  // Scale and opacity based on progress
  const iconScale = 0.5 + (progress * 0.5);
  const iconOpacity = Math.min(progress * 1.5, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ backgroundColor, minHeight: '100vh' }}
    >
      {/* Pull indicator */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
        style={{
          height: `${Math.max(pullDistance, 0)}px`,
          transform: `translateY(-100%)`,
        }}
      >
        <div
          className="flex items-center space-x-2"
          style={{
            opacity: iconOpacity,
            transform: `scale(${iconScale})`,
          }}
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : rotation }}
            transition={{ duration: isRefreshing ? 1 : 0 }}
          >
            <RefreshCw
              size={24}
              className="text-primary"
              style={{ color: 'hsl(var(--primary))' }}
            />
          </motion.div>
          <span className="text-sm font-medium text-primary" style={{ color: 'hsl(var(--primary))' }}>
            {isRefreshing
              ? (language === Language.ZH ? '刷新中...' : 'Refreshing...')
              : (language === Language.ZH ? '下拉刷新' : 'Pull to refresh')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Hook for tracking last refresh timestamp
 */
export function useRefreshTimestamp() {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async (refreshFn: () => Promise<void>) => {
    await refreshFn();
    setLastRefresh(new Date());
  }, []);

  const getTimeAgo = useCallback((language: Language): string => {
    if (!lastRefresh) return '';

    const now = new Date();
    const diffMs = now.getTime() - lastRefresh.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (language === Language.ZH) {
      if (diffSecs < 10) return '刚刚更新';
      if (diffSecs < 60) return `${diffSecs}秒前更新`;
      if (diffMins < 60) return `${diffMins}分钟前更新`;
      return lastRefresh.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else {
      if (diffSecs < 10) return 'Just updated';
      if (diffSecs < 60) return `Updated ${diffSecs}s ago`;
      if (diffMins < 60) return `Updated ${diffMins}m ago`;
      return lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  }, [lastRefresh]);

  return { lastRefresh, refresh, getTimeAgo };
}
