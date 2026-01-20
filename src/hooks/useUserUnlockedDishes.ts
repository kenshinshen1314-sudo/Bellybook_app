import { useState, useEffect, useCallback } from 'react';
import { ranking, type UserUnlockedDishesResponse } from '@/api/ranking';

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
    // Skip if no user ID or if it's the offline 'current-user'
    if (!userId || userId === 'current-user') {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await ranking.getUserUnlockedDishes(userId);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user unlocked dishes';
      setError(errorMessage);
      console.error('[useUserUnlockedDishes] Error:', err);
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
