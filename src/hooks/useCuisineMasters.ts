import { useState, useEffect, useCallback } from 'react';
import { ranking } from '@/api';
import type { CuisineMasterEntry, CuisineMastersResponse, RankingPeriod } from '@/api/ranking';
import { useToastNotification } from '@/contexts/ToastContext';
import { Language } from '@/types';
import { logger } from '@/utils/logger';

interface UseCuisineMastersResult {
  masters: CuisineMasterEntry[];
  cuisineName?: string;
  period: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching cuisine masters from backend API
 * Used for "菜系专家" section in Social tab
 */
export function useCuisineMasters(
  cuisineName?: string,
  lang: Language = Language.ZH,
  period: RankingPeriod = 'ALL_TIME'
): UseCuisineMastersResult {
  const [data, setData] = useState<{
    masters: CuisineMasterEntry[];
    cuisineName?: string;
    period: string;
  }>({
    masters: [],
    cuisineName: undefined,
    period: 'ALL_TIME',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToastNotification();

  /**
   * Load cuisine masters from backend API
   */
  const loadCuisineMasters = useCallback(async () => {
    logger.info('[useCuisineMasters]', 'Starting to load cuisine masters...');
    setIsLoading(true);
    setError(null);

    try {
      logger.debug('[useCuisineMasters]', 'Calling ranking.getCuisineMasters with:', { cuisineName, period });
      const response = await ranking.getCuisineMasters(cuisineName, period);
      logger.debug('[useCuisineMasters]', `Masters count: ${response.masters?.length}`);
      setData({
        masters: response.masters,
        cuisineName: response.cuisineName,
        period: response.period,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cuisine masters';
      setError(errorMessage);
      logger.error('[useCuisineMasters]', 'Error loading cuisine masters:', err);

      showError(
        lang === Language.ZH ? '加载失败' : 'Load Failed',
        lang === Language.ZH ? `无法加载菜系专家排行榜` : 'Failed to load cuisine masters ranking'
      );
    } finally {
      setIsLoading(false);
    }
  }, [cuisineName, period, lang, showError]);

  /**
   * Refresh cuisine masters
   */
  const refresh = useCallback(async () => {
    await loadCuisineMasters();
  }, [loadCuisineMasters]);

  // Load cuisine masters on mount
  useEffect(() => {
    loadCuisineMasters();
  }, [loadCuisineMasters]);

  return {
    masters: data.masters,
    cuisineName: data.cuisineName,
    period: data.period,
    isLoading,
    error,
    refresh,
  };
}
