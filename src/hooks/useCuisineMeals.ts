import { useState, useEffect, useCallback } from 'react';
import { meals } from '@/api';
import type { MealResponse, PaginatedResponse } from '@/api/types';
import { useToastNotification } from '@/contexts/ToastContext';
import { Language } from '@/types';
import { logger } from '@/utils/logger';

interface UseCuisineMealsResult {
  meals: MealResponse[];
  isLoading: boolean;
  error: string | null;
  total: number;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching meals by cuisine from backend API
 * Used for cuisine detail modal
 */
export function useCuisineMeals(
  cuisine?: string,
  lang: Language = Language.ZH,
  pageSize: number = 20
): UseCuisineMealsResult {
  const [mealsList, setMealsList] = useState<MealResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { showError } = useToastNotification();

  /**
   * Load meals by cuisine
   */
  const loadMeals = useCallback(async (pageNum: number = 1) => {
    if (!cuisine) {
      setMealsList([]);
      setTotal(0);
      setHasMore(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<MealResponse> = await meals.getByCuisine(cuisine, {
        page: pageNum,
        limit: pageSize,
      });

      if (pageNum === 1) {
        setMealsList(response.data);
      } else {
        setMealsList(prev => [...prev, ...response.data]);
      }

      setTotal(response.total);
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cuisine meals';
      setError(errorMessage);
      logger.error('[useCuisineMeals]', 'Error loading meals:', err);

      showError(
        lang === Language.ZH ? '加载失败' : 'Load Failed',
        lang === Language.ZH ? `无法加载${cuisine}菜品` : `Failed to load ${cuisine} dishes`
      );
    } finally {
      setIsLoading(false);
    }
  }, [cuisine, pageSize, lang, showError]);

  /**
   * Load more meals
   */
  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore && cuisine) {
      await loadMeals(page + 1);
    }
  }, [isLoading, hasMore, page, cuisine, loadMeals]);

  /**
   * Refresh meals
   */
  const refresh = useCallback(async () => {
    setPage(1);
    await loadMeals(1);
  }, [loadMeals]);

  // Load meals when cuisine changes
  useEffect(() => {
    if (cuisine) {
      loadMeals(1);
    } else {
      setMealsList([]);
      setTotal(0);
      setHasMore(false);
    }
  }, [cuisine]);

  return {
    meals: mealsList,
    isLoading,
    error,
    total,
    loadMore,
    hasMore,
    refresh,
  };
}
