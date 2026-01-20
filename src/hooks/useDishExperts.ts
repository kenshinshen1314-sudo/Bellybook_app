import { useState, useEffect, useCallback } from 'react';
import { ranking } from '@/api';
import type { DishExpertEntry, DishExpertsResponse, RankingPeriod } from '@/api/ranking';
import { useToastNotification } from '@/contexts/ToastContext';
import { Language } from '@/types';

interface UseDishExpertsResult {
  experts: DishExpertEntry[];
  period: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching dish experts from backend API
 * Used for "菜系专家" section in Social tab
 */
export function useDishExperts(
  lang: Language = Language.ZH,
  period: RankingPeriod = 'ALL_TIME'
): UseDishExpertsResult {
  const [data, setData] = useState<{
    experts: DishExpertEntry[];
    period: string;
  }>({
    experts: [],
    period: 'ALL_TIME',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToastNotification();

  /**
   * Load dish experts from backend API
   */
  const loadDishExperts = useCallback(async () => {
    console.log('[useDishExperts] Starting to load dish experts...');
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useDishExperts] Calling ranking.getDishExperts with:', { period });
      const response = await ranking.getDishExperts(period);
      console.log('[useDishExperts] Response received:', response);
      console.log('[useDishExperts] Experts count:', response.experts?.length);
      console.log('[useDishExperts] Experts data:', JSON.stringify(response.experts, null, 2));
      setData({
        experts: response.experts,
        period: response.period,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dish experts';
      setError(errorMessage);
      console.error('[useDishExperts] Error loading dish experts:', err);
      console.error('[useDishExperts] Error details:', JSON.stringify(err));

      showError(
        lang === Language.ZH ? '加载失败' : 'Load Failed',
        lang === Language.ZH ? `无法加载菜系专家排行榜` : 'Failed to load dish experts ranking'
      );
    } finally {
      setIsLoading(false);
    }
  }, [period, lang, showError]);

  /**
   * Refresh dish experts
   */
  const refresh = useCallback(async () => {
    await loadDishExperts();
  }, [loadDishExperts]);

  // Load dish experts on mount
  useEffect(() => {
    loadDishExperts();
  }, [loadDishExperts]);

  return {
    experts: data.experts,
    period: data.period,
    isLoading,
    error,
    refresh,
  };
}
