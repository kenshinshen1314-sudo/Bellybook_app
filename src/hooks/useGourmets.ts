import { useState, useEffect, useCallback } from 'react';
import { ranking, type RankingPeriod, type GourmetsResponse, type GourmetEntry } from '@/api/ranking';
import { useToastNotification } from '@/contexts/ToastContext';
import { Language } from '@/types';
import { logger } from '@/utils/logger';

interface UseGourmetsResult {
  gourmets: GourmetEntry[];
  totalUsers: number;
  period: RankingPeriod;
  isLoading: boolean;
  error: string | null;
  setPeriod: (period: RankingPeriod) => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching gourmets ranking from backend API
 * Shows users with most diverse cuisines (sorted by cuisine count)
 * Used for "美食家榜" ranking page
 */
export function useGourmets(
  lang: Language = Language.ZH,
  initialPeriod: RankingPeriod = 'ALL_TIME'
): UseGourmetsResult {
  const [data, setData] = useState<{
    gourmets: GourmetEntry[];
    totalUsers: number;
    period: RankingPeriod;
  }>({
    gourmets: [],
    totalUsers: 0,
    period: initialPeriod,
  });
  const [period, setPeriod] = useState<RankingPeriod>(initialPeriod);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToastNotification();

  /**
   * Load gourmets from backend API
   */
  const loadGourmets = useCallback(async () => {
    logger.info('[useGourmets]', 'Starting to load gourmets...');
    setIsLoading(true);
    setError(null);

    try {
      logger.debug('[useGourmets]', 'Calling ranking.getGourmets with:', { period });
      const response: GourmetsResponse = await ranking.getGourmets(period);
      logger.debug('[useGourmets]', `Gourmets count: ${response.gourmets?.length}`);

      // Calculate total users (estimate from gourmets list length for now)
      // Backend could provide this in a separate stats endpoint
      const totalUsers = response.gourmets?.length || 0;

      setData({
        gourmets: response.gourmets || [],
        totalUsers,
        period: response.period as RankingPeriod,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load gourmets';
      setError(errorMessage);
      logger.error('[useGourmets]', 'Error loading gourmets:', err);

      showError(
        lang === Language.ZH ? '加载失败' : 'Load Failed',
        lang === Language.ZH ? `无法加载美食家排行榜` : 'Failed to load gourmet ranking'
      );
    } finally {
      setIsLoading(false);
    }
  }, [period, lang, showError]);

  /**
   * Refresh gourmets
   */
  const refresh = useCallback(async () => {
    await loadGourmets();
  }, [loadGourmets]);

  // Load gourmets on mount and when period changes
  useEffect(() => {
    loadGourmets();
  }, [loadGourmets]);

  return {
    gourmets: data.gourmets,
    totalUsers: data.totalUsers,
    period: data.period,
    isLoading,
    error,
    setPeriod,
    refresh,
  };
}
