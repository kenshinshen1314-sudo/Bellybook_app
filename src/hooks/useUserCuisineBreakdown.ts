import { useState, useEffect, useCallback } from 'react';
import { ranking, type RankingPeriod, type AllUsersDishesResponse } from '@/api/ranking';
import { useToastNotification } from '@/contexts/ToastContext';
import { Language } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Single cuisine entry for a user
 */
export interface UserCuisineBreakdown {
  cuisineName: string;
  dishCount: number;
  color: string; // Color for this cuisine in the stacked bar chart
}

/**
 * User with cuisine breakdown
 */
export interface UserWithCuisines {
  userId: string;
  username: string;
  avatarUrl: string | null;
  totalDishCount: number;
  cuisineCount: number;
  cuisines: UserCuisineBreakdown[];
}

interface UseUserCuisineBreakdownResult {
  users: UserWithCuisines[];
  period: RankingPeriod;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Color palette for different cuisines in stacked bar chart
 */
const CUISINE_COLORS = [
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#a855f7', // purple-500
  '#eab308', // yellow-500
  '#6366f1', // indigo-500
];

/**
 * Get a consistent color for a cuisine name based on hash
 */
function getCuisineColor(cuisineName: string): string {
  let hash = 0;
  for (let i = 0; i < cuisineName.length; i++) {
    hash = cuisineName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CUISINE_COLORS.length;
  return CUISINE_COLORS[index];
}

/**
 * Hook for fetching user cuisine breakdown from backend API
 * Aggregates user+cuisine entries to show each user's cuisine composition
 * Used for "美食家榜" stacked bar chart
 */
export function useUserCuisineBreakdown(
  lang: Language = Language.ZH,
  period: RankingPeriod = 'ALL_TIME'
): UseUserCuisineBreakdownResult {
  const [data, setData] = useState<{
    users: UserWithCuisines[];
    period: RankingPeriod;
  }>({
    users: [],
    period: 'ALL_TIME',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToastNotification();

  /**
   * Load and aggregate user cuisine breakdown from backend API
   */
  const loadData = useCallback(async () => {
    logger.info('[useUserCuisineBreakdown]', 'Starting to load user cuisine breakdown...');
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all user+cuisine entries (request up to 1000 users)
      const response: AllUsersDishesResponse = await ranking.getAllUsersDishes(period, 1000);
      logger.debug('[useUserCuisineBreakdown]', 'Response received:', response);

      // Aggregate by user
      const userMap = new Map<string, UserWithCuisines>();

      const entries = response.entries || [];
      for (const entry of entries) {
        let user = userMap.get(entry.userId);

        if (!user) {
          user = {
            userId: entry.userId,
            username: entry.username,
            avatarUrl: entry.avatarUrl,
            totalDishCount: 0,
            cuisineCount: 0,
            cuisines: [],
          };
          userMap.set(entry.userId, user);
        }

        // Add cuisine breakdown
        user.cuisines.push({
          cuisineName: entry.cuisineName,
          dishCount: entry.dishCount,
          color: getCuisineColor(entry.cuisineName),
        });

        // Update totals
        user.totalDishCount += entry.dishCount;
        user.cuisineCount = user.cuisines.length;
      }

      // Convert to array and sort by cuisine count (descending)
      const users = Array.from(userMap.values())
        .sort((a, b) => b.cuisineCount - a.cuisineCount)
        .map((user, index) => ({
          ...user,
          // Sort cuisines within each user by dish count (descending)
          cuisines: user.cuisines.sort((a, b) => b.dishCount - a.dishCount),
        }));

      logger.debug('[useUserCuisineBreakdown]', 'Aggregated users:', users);
      logger.debug('[useUserCuisineBreakdown]', `Total users count: ${users.length}`);

      setData({
        users,
        period: response.period as RankingPeriod,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user cuisine breakdown';
      setError(errorMessage);
      logger.error('[useUserCuisineBreakdown]', 'Error loading data:', err);

      showError(
        lang === Language.ZH ? '加载失败' : 'Load Failed',
        lang === Language.ZH ? `无法加载美食家排行榜` : 'Failed to load gourmet ranking'
      );
    } finally {
      setIsLoading(false);
    }
  }, [period, lang, showError]);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    users: data.users,
    period: data.period,
    isLoading,
    error,
    refresh,
  };
}
