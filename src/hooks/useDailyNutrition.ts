import { useState, useEffect } from 'react';
import { nutrition, type DailyNutritionResponse } from '@/api/nutrition';
import { logger } from '@/utils/logger';

interface UseDailyNutritionResult {
  data: DailyNutritionResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching daily nutrition data from backend API
 */
export function useDailyNutrition(date?: string): UseDailyNutritionResult {
  const [data, setData] = useState<DailyNutritionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      logger.debug('[useDailyNutrition] Fetching daily nutrition data');
      const result = await nutrition.getDaily(date);
      setData(result);
      logger.debug('[useDailyNutrition] Daily nutrition data received:', result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load daily nutrition';
      setError(errorMessage);
      logger.error('[useDailyNutrition] Error loading daily nutrition:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
