/**
 * Nutrition API
 *
 * API endpoints for nutrition statistics
 */

import { apiClient } from './client';
import type { ApiResponse } from './types';

/**
 * Daily nutrition response
 */
export interface DailyNutritionResponse {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbohydrates: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  mealCount: number;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  snackCount: number;
  meals: Array<{
    id: string;
    userId: string;
    imageUrl: string;
    thumbnailUrl?: string;
    analysis: unknown;
    mealType: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    isSynced: boolean;
    version: number;
  }>;
}

/**
 * Nutrition API endpoints
 */
export const nutrition = {
  /**
   * Get daily nutrition data
   * @param date - Date in YYYY-MM-DD format (optional, defaults to today)
   * @returns Daily nutrition data
   */
  getDaily: async (date?: string): Promise<DailyNutritionResponse> => {
    const params = date ? { date } : undefined;
    return apiClient.get<DailyNutritionResponse>('/nutrition/daily', { params });
  },
};
