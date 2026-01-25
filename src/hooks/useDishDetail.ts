import { useState, useEffect, useCallback } from 'react';
import { meals } from '@/api';
import type { MealResponse } from '@/api/types';
import { useToastNotification } from '@/contexts/ToastContext';
import { Language } from '@/types';
import { logger } from '@/utils/logger';

interface DishDetail {
  name: string;
  cuisine: string;
  appearanceCount: number;
  averageCalories: number | null;
  averageProtein: number | null;
  averageFat: number | null;
  averageCarbs: number | null;
  description: string | null;
  historicalOrigins: string | null;
}

interface UseDishDetailResult {
  meals: MealResponse[];
  dish: DishDetail | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching dish details from backend API
 * Used for dish detail page
 */
export function useDishDetail(
  dishName?: string,
  lang: Language = Language.ZH
): UseDishDetailResult {
  const [data, setData] = useState<{ meals: MealResponse[]; dish: DishDetail | null }>({
    meals: [],
    dish: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useToastNotification();

  /**
   * Load dish details from backend API
   */
  const loadDishDetail = useCallback(async () => {
    if (!dishName) {
      setData({ meals: [], dish: null });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await meals.getByDishName(dishName);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dish details';
      setError(errorMessage);
      logger.error('[useDishDetail]', 'Error loading dish details:', err);

      showError(
        lang === Language.ZH ? '加载失败' : 'Load Failed',
        lang === Language.ZH ? `无法加载菜品详情` : 'Failed to load dish details'
      );
    } finally {
      setIsLoading(false);
    }
  }, [dishName, lang, showError]);

  /**
   * Refresh dish details
   */
  const refresh = useCallback(async () => {
    await loadDishDetail();
  }, [loadDishDetail]);

  // Load dish details when dishName changes
  useEffect(() => {
    loadDishDetail();
  }, [loadDishDetail]);

  return {
    meals: data.meals,
    dish: data.dish,
    isLoading,
    error,
    refresh,
  };
}
