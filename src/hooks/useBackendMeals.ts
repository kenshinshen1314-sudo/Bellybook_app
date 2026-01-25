import { useState, useEffect, useCallback } from 'react';
import { meals, tokenManager } from '@/api';
import type { MealResponse, PaginatedResponse, UpdateProfileDto, UpdateSettingsDto } from '@/api/types';
import { useToastNotification } from '@/contexts/ToastContext';
import { Language } from '@/types';
import type { MealAnalysis, MealType } from '@/db/schema';
import { ApiRequestError } from '@/api';
import { logger } from '@/utils/logger';

// Type for meal update data
export type UpdateMealDto = {
  imageUrl?: string;
  analysis?: MealAnalysis;
  mealType?: MealType;
  notes?: string;
};

interface UseBackendMealsResult {
  meals: MealResponse[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  updateMeal: (mealId: string, data: UpdateMealDto) => Promise<void>;
}

/**
 * Hook for fetching meals from backend API
 * Used for home page "近期饮食" section
 */
export function useBackendMeals(
  userId?: string,
  lang: Language = Language.ZH,
  limit: number = 5
): UseBackendMealsResult {
  const [mealsList, setMealsList] = useState<MealResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useToastNotification();

  /**
   * Load meals from backend API
   */
  const loadMeals = useCallback(async () => {
    // Skip API call if user is not authenticated
    if (!tokenManager.isAuthenticated()) {
      logger.debug('[useBackendMeals]', 'User not authenticated, skipping backend fetch');
      setMealsList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<MealResponse> = await meals.getAll({
        page: 1,
        limit,
      });
      setMealsList(response.data);
    } catch (err) {
      // Don't show error toast for authentication errors (expected when not logged in)
      const isAuthError = err instanceof ApiRequestError &&
        (err.status === 401 || err.status === 403 || err.status === 0);

      const errorMessage = err instanceof Error ? err.message : 'Failed to load meals from server';
      setError(errorMessage);
      logger.error('[useBackendMeals]', 'Error loading meals:', err);

      if (!isAuthError) {
        showError(
          lang === Language.ZH ? '加载失败' : 'Load Failed',
          lang === Language.ZH ? '无法从服务器获取数据' : 'Failed to load data from server'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [limit, lang, showError]);

  /**
   * Delete a meal
   */
  const deleteMeal = useCallback(async (mealId: string) => {
    // Check authentication before proceeding
    if (!tokenManager.isAuthenticated()) {
      showError(
        lang === Language.ZH ? '未登录' : 'Not Logged In',
        lang === Language.ZH ? '请先登录' : 'Please log in first'
      );
      throw new Error('User not authenticated');
    }

    try {
      await meals.delete(mealId);
      // Remove from local state
      setMealsList(prev => prev.filter(m => m.id !== mealId));

      showSuccess(
        lang === Language.ZH ? '删除成功' : 'Deleted',
        lang === Language.ZH ? '餐品已删除' : 'Meal deleted successfully'
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete meal';
      logger.error('[useBackendMeals]', 'Error deleting meal:', err);

      showError(
        lang === Language.ZH ? '删除失败' : 'Delete Failed',
        lang === Language.ZH ? '请重试' : 'Please try again'
      );
      throw err;
    }
  }, [lang, showError, showSuccess]);

  /**
   * Update a meal
   */
  const updateMeal = useCallback(async (mealId: string, data: UpdateMealDto) => {
    // Check authentication before proceeding
    if (!tokenManager.isAuthenticated()) {
      showError(
        lang === Language.ZH ? '未登录' : 'Not Logged In',
        lang === Language.ZH ? '请先登录' : 'Please log in first'
      );
      throw new Error('User not authenticated');
    }

    try {
      const response = await meals.update(mealId, data);
      // Update local state
      setMealsList(prev =>
        prev.map(m => m.id === mealId ? response.data : m)
      );

      showSuccess(
        lang === Language.ZH ? '保存成功' : 'Saved',
        lang === Language.ZH ? '餐品信息已更新' : 'Meal updated successfully'
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update meal';
      logger.error('[useBackendMeals]', 'Error updating meal:', err);

      showError(
        lang === Language.ZH ? '保存失败' : 'Save Failed',
        lang === Language.ZH ? '请重试' : 'Please try again'
      );
      throw err;
    }
  }, [lang, showError, showSuccess]);

  /**
   * Refresh meals from backend
   */
  const refresh = useCallback(async () => {
    await loadMeals();
  }, [loadMeals]);

  // Load meals on mount
  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  return {
    meals: mealsList,
    isLoading,
    error,
    refresh,
    deleteMeal,
    updateMeal,
  };
}
