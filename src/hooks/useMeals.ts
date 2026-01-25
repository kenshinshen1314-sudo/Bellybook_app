import { useState, useEffect, useCallback } from 'react';
import { meals, type Meal } from '@/db';
import { generateId, type MealAnalysis } from '@/db/schema';
import { generateThumbnail } from '@/utils/imageUtils';
import { logger } from '@/utils/logger';

interface UseMealsResult {
  meals: Meal[];
  isLoading: boolean;
  error: string | null;
  saveMeal: (imageUrl: string, analysis: MealAnalysis, mealType?: string, notes?: string) => Promise<string>;
  updateMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  getMealById: (mealId: string) => Promise<Meal | undefined>;
  getMealsByDateRange: (startDate: string, endDate: string) => Promise<Meal[]>;
  refresh: () => Promise<void>;
}

const DEFAULT_USER_ID = 'current-user';

/**
 * Hook for managing meal records
 * Data is persisted to IndexedDB
 */
export function useMeals(userId: string = DEFAULT_USER_ID): UseMealsResult {
  const [mealsList, setMealsList] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all meals from IndexedDB
   */
  const loadMeals = useCallback(async () => {
    logger.debug('[useMeals]', 'loadMeals called with userId:', userId);
    setIsLoading(true);
    setError(null);

    try {
      const allMeals = await meals.getAll(userId);
      logger.debug('[useMeals]', `Loaded meals: ${allMeals.length} for userId: ${userId}`);
      // Sort by createdAt descending (newest first)
      const sortedMeals = allMeals.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMealsList(sortedMeals);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load meals';
      setError(errorMessage);
      logger.error('[useMeals]', 'Error loading meals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Save a new meal record
   */
  const saveMeal = useCallback(async (
    imageUrl: string,
    analysis: MealAnalysis,
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    notes?: string
  ): Promise<string> => {
    setError(null);

    try {
      // Generate thumbnail for list view directly from base64 URL
      let thumbnailUrl = imageUrl;
      try {
        // Convert base64 to Blob for thumbnail generation
        const imageBlob = await fetch(imageUrl).then(r => r.blob());
        thumbnailUrl = await generateThumbnail(imageBlob, 200, 200, 0.7);
        logger.debug('[useMeals]', `Thumbnail generated successfully, length: ${thumbnailUrl?.length}`);
      } catch (thumbError) {
        logger.warn('[useMeals]', 'Failed to generate thumbnail, using original:', thumbError);
        // Use original URL as fallback
      }

      const newMeal: Meal = {
        id: generateId('meal'),
        userId,
        imageUrl,
        thumbnailUrl, // Store thumbnail URL
        analysis: {
          foodName: analysis.foodName || '未知食物',
          cuisine: analysis.cuisine,
          plating: analysis.plating,
          sensory: analysis.sensory,
          container: analysis.container,
          description: analysis.description,
          nutrition: analysis.nutrition || {
            calories: 0,
            protein: 0,
            fat: 0,
            carbohydrates: 0,
          },
          ingredients: analysis.ingredients,
          suggestions: analysis.suggestions,
          poeticDescription: analysis.poeticDescription,
          nutritionCommentary: analysis.nutritionCommentary,
          historicalBackground: analysis.historicalBackground,
          analyzedAt: new Date().toISOString(),
        },
        mealType: mealType,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSynced: false,
      };

      const mealId = await meals.add(newMeal);

      // Add to local state
      setMealsList(prev => [newMeal, ...prev]);

      logger.debug('[useMeals]', `Meal saved: ${mealId}`);
      return mealId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save meal';
      setError(errorMessage);
      logger.error('[useMeals]', 'Error saving meal:', err);
      throw err;
    }
  }, [userId]);

  /**
   * Update an existing meal
   */
  const updateMeal = useCallback(async (meal: Meal) => {
    setError(null);

    try {
      const updatedMeal: Meal = {
        ...meal,
        updatedAt: new Date().toISOString(),
      };

      await meals.update(updatedMeal);

      // Update local state
      setMealsList(prev =>
        prev.map(m => m.id === meal.id ? updatedMeal : m)
      );

      logger.debug('[useMeals]', `Meal updated: ${meal.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update meal';
      setError(errorMessage);
      logger.error('[useMeals]', 'Error updating meal:', err);
      throw err;
    }
  }, []);

  /**
   * Delete a meal
   */
  const deleteMeal = useCallback(async (mealId: string) => {
    setError(null);

    try {
      await meals.delete(mealId);

      // Remove from local state
      setMealsList(prev => prev.filter(m => m.id !== mealId));

      logger.debug('[useMeals]', `Meal deleted: ${mealId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete meal';
      setError(errorMessage);
      logger.error('[useMeals]', 'Error deleting meal:', err);
      throw err;
    }
  }, []);

  /**
   * Get a single meal by ID
   */
  const getMealById = useCallback(async (mealId: string): Promise<Meal | undefined> => {
    return meals.get(mealId);
  }, []);

  /**
   * Get meals by date range
   */
  const getMealsByDateRange = useCallback(async (
    startDate: string,
    endDate: string
  ): Promise<Meal[]> => {
    return meals.getByDateRange(userId, startDate, endDate);
  }, [userId]);

  /**
   * Refresh meals from IndexedDB
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
    saveMeal,
    updateMeal,
    deleteMeal,
    getMealById,
    getMealsByDateRange,
    refresh,
  };
}

/**
 * Convenience function to save a meal (for use outside React components)
 */
export async function saveMeal(
  userId: string,
  imageUrl: string,
  analysis: MealAnalysis,
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  notes?: string
): Promise<string> {
  // Generate thumbnail for list view
  let thumbnailUrl = imageUrl;
  try {
    // Convert base64 to Blob for thumbnail generation
    const imageBlob = await fetch(imageUrl).then(r => r.blob());
    thumbnailUrl = await generateThumbnail(imageBlob, 200, 200, 0.7);
    logger.debug('[saveMeal]', `Thumbnail generated successfully, length: ${thumbnailUrl?.length}`);
  } catch (thumbError) {
    logger.warn('[saveMeal]', 'Failed to generate thumbnail, using original:', thumbError);
  }

  const newMeal: Meal = {
    id: generateId('meal'),
    userId,
    imageUrl,
    thumbnailUrl,
    analysis: {
      foodName: analysis.foodName || '未知食物',
      cuisine: analysis.cuisine,
      plating: analysis.plating,
      sensory: analysis.sensory,
      container: analysis.container,
      description: analysis.description,
      nutrition: analysis.nutrition || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
      },
      ingredients: analysis.ingredients,
      suggestions: analysis.suggestions,
      poeticDescription: analysis.poeticDescription,
      nutritionCommentary: analysis.nutritionCommentary,
      historicalBackground: analysis.historicalBackground,
      analyzedAt: new Date().toISOString(),
    },
    mealType: mealType,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSynced: false,
  };

  return meals.add(newMeal);
}

/**
 * Convenience function to get meals by date range (for use outside React components)
 */
export async function getMealsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Meal[]> {
  return meals.getByDateRange(userId, startDate, endDate);
}
