import { useState, useEffect, useCallback } from 'react';
import { ranking, type RankingPeriod, type CuisineExpertDetailResponse } from '@/api/ranking';
import { logger } from '@/utils/logger';

interface UseCuisineExpertDetailResult {
  detail: CuisineExpertDetailResponse | null;
  period: RankingPeriod;
  isLoading: boolean;
  error: string | null;
  setPeriod: (period: RankingPeriod) => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching cuisine expert detail
 * @param userId User ID
 * @param cuisineName Cuisine name
 * @param initialPeriod Initial time period (default: ALL_TIME)
 */
export function useCuisineExpertDetail(
  userId: string,
  cuisineName: string,
  initialPeriod: RankingPeriod = 'ALL_TIME'
): UseCuisineExpertDetailResult {
  const [detail, setDetail] = useState<CuisineExpertDetailResponse | null>(null);
  const [period, setPeriod] = useState<RankingPeriod>(initialPeriod);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!userId || !cuisineName) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await ranking.getCuisineExpertDetail(userId, cuisineName, period);
      setDetail(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cuisine expert detail';
      setError(errorMessage);
      logger.error('[useCuisineExpertDetail]', 'Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, cuisineName, period]);

  const refresh = useCallback(async () => {
    await fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    detail,
    period,
    isLoading,
    error,
    setPeriod,
    refresh,
  };
}
