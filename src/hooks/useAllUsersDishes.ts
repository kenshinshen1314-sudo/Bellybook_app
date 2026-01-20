import { useState, useEffect, useCallback } from 'react';
import { ranking, type RankingPeriod, type AllUsersDishesResponse } from '@/api/ranking';

interface UseAllUsersDishesResult {
  data: AllUsersDishesResponse | null;
  period: RankingPeriod;
  isLoading: boolean;
  error: string | null;
  setPeriod: (period: RankingPeriod) => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching all users dishes list
 * @param initialPeriod Initial time period (default: WEEKLY)
 */
export function useAllUsersDishes(
  initialPeriod: RankingPeriod = 'WEEKLY'
): UseAllUsersDishesResult {
  const [data, setData] = useState<AllUsersDishesResponse | null>(null);
  const [period, setPeriod] = useState<RankingPeriod>(initialPeriod);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await ranking.getAllUsersDishes(period);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch all users dishes';
      setError(errorMessage);
      console.error('[useAllUsersDishes] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    period,
    isLoading,
    error,
    setPeriod,
    refresh,
  };
}
