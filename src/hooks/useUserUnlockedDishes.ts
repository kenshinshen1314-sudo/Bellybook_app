import { useState, useEffect, useCallback } from 'react';
import { ranking, type UserUnlockedDishesResponse } from '@/api/ranking';
import { logger } from '@/utils/logger';

interface UseUserUnlockedDishesResult {
  data: UserUnlockedDishesResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching user unlocked dishes
 * @param userId User ID
 */
export function useUserUnlockedDishes(userId: string): UseUserUnlockedDishesResult {
  const [data, setData] = useState<UserUnlockedDishesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Skip if no userId or if it's the offline 'current-user'
    // Backend doesn't recognize 'current-user' as a valid user ID
    if (!userId || userId === 'current-user') {
      logger.warn('[useUserUnlockedDishes] Skipping - invalid userId:', userId);
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.debug('[useUserUnlockedDishes] Fetching data for userId:', userId);
      const result = await ranking.getUserUnlockedDishes(userId);
      logger.debug('[useUserUnlockedDishes] Raw API response:', JSON.stringify(result, null, 2));
      logger.debug('[useUserUnlockedDishes] Fetched data summary:', {
        userId: result.userId,
        totalDishes: result.totalDishes,
        totalMeals: result.totalMeals,
        dishesCount: result.dishes?.length || 0,
        firstFewDishes: result.dishes?.slice(0, 5).map(d => ({ dishName: d.dishName, cuisine: d.cuisine }))
      });
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user unlocked dishes';
      setError(errorMessage);
      logger.error('[useUserUnlockedDishes]', 'Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}
