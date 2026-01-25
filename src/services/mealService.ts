/**
 * Meal Service
 * Centralized service for meal-related operations
 * Ensures consistent userId handling across all operations
 */

import { meals, dailyNutrition, cuisineUnlocks } from '@/db';
import type { Meal, DailyNutrition } from '@/db/schema';
import { generateThumbnail } from '@/utils/imageUtils';
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('MealService');

/**
 * Get the current user ID
 * Priority: authenticated user > 'current-user' for offline mode
 */
export function getCurrentUserId(authUserId: string | null | undefined): string {
  return authUserId || 'current-user';
}

/**
 * Save a new meal with automatic side effects:
 * - Updates daily nutrition
 * - Updates cuisine unlocks
 */
export async function saveMeal(
  authUserId: string | null | undefined,
  imageUrl: string,
  analysis: any,
  mealType?: string,
  notes?: string
): Promise<string> {
  // Always use the current userId at save time
  const userId = getCurrentUserId(authUserId);
  logger.debug('saveMeal called:', { authUserId, userId });

  // Generate thumbnail
  let thumbnailUrl = imageUrl;
  try {
    const imageBlob = await fetch(imageUrl).then(r => r.blob());
    thumbnailUrl = await generateThumbnail(imageBlob, 200, 200, 0.7);
    logger.debug('Thumbnail generated');
  } catch (thumbError) {
    logger.warn('Failed to generate thumbnail:', thumbError);
  }

  // Create meal record
  const newMeal: Meal = {
    id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      analyzedAt: new Date().toISOString(),
    },
    mealType: mealType as any,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSynced: false,
  };

  // Save meal
  await meals.add(newMeal);
  logger.debug('Meal saved:', { id: newMeal.id, userId, cuisine: analysis.cuisine });

  // Update daily nutrition
  await updateDailyNutrition(userId, newMeal);

  // Update cuisine unlocks
  if (analysis.cuisine) {
    await updateCuisineUnlock(userId, analysis.cuisine);
  }

  return newMeal.id;
}

/**
 * Update daily nutrition summary after saving a meal
 */
async function updateDailyNutrition(userId: string, meal: Meal): Promise<void> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const nutrition = meal.analysis.nutrition;

  // Get existing daily nutrition
  const existing = await dailyNutrition.get(userId, today);

  if (existing) {
    // Update existing
    existing.totalCalories += nutrition.calories;
    existing.totalProtein += nutrition.protein;
    existing.totalFat += nutrition.fat;
    existing.totalCarbohydrates += nutrition.carbohydrates;
    existing.mealCount += 1;
    await dailyNutrition.set(existing);
  } else {
    // Create new
    await dailyNutrition.set({
      date: today,
      userId,
      totalCalories: nutrition.calories,
      totalProtein: nutrition.protein,
      totalFat: nutrition.fat,
      totalCarbohydrates: nutrition.carbohydrates,
      mealCount: 1,
    });
  }

  logger.debug('Daily nutrition updated:', { userId, date: today });
}

/**
 * Update cuisine unlock record
 */
async function updateCuisineUnlock(userId: string, cuisineName: string): Promise<void> {
  const existing = await cuisineUnlocks.getOrCreate(userId, cuisineName);

  // Only increment if this is a new unlock (not just updating meal count)
  // The getOrCreate already sets mealCount to 1 for new unlocks
  if (existing.mealCount === 1) {
    logger.debug('New cuisine unlocked:', { userId, cuisine: cuisineName });
  } else {
    await cuisineUnlocks.incrementMealCount(userId, cuisineName);
    logger.debug('Cuisine meal count updated:', { userId, cuisine: cuisineName });
  }
}

/**
 * Get all meals for the current user
 */
export async function getUserMeals(authUserId: string | null | undefined): Promise<Meal[]> {
  const userId = getCurrentUserId(authUserId);
  return meals.getAll(userId);
}

/**
 * Get meals by date range for the current user
 */
export async function getMealsByDateRange(
  authUserId: string | null | undefined,
  startDate: string,
  endDate: string
): Promise<Meal[]> {
  const userId = getCurrentUserId(authUserId);
  return meals.getByDateRange(userId, startDate, endDate);
}

/**
 * Get cuisine unlocks for the current user
 */
export async function getUserCuisineUnlocks(authUserId: string | null | undefined) {
  const userId = getCurrentUserId(authUserId);
  return cuisineUnlocks.getAll(userId);
}

/**
 * Get daily nutrition for the current user
 */
export async function getUserDailyNutrition(
  authUserId: string | null | undefined,
  date: string
): Promise<DailyNutrition | undefined> {
  const userId = getCurrentUserId(authUserId);
  return dailyNutrition.get(userId, date);
}
