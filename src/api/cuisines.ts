/**
 * Cuisines API
 */

import { apiClient } from './client';
import type { ApiResponse } from './types';

/**
 * Cuisine stats response
 */
export interface CuisineStatsResponse {
  totalUnlocked: number;
  totalAvailable: number;
  unlockProgress: number;
  topCuisines: Array<{ name: string; count: number }>;
  recentUnlocks: Array<{ name: string; unlockedAt: string }>;
}

/**
 * Cuisine unlock response
 */
export interface CuisineUnlockResponse {
  cuisineName: string;
  mealCount: number;
  firstMealAt: string;
  lastMealAt: string;
  cuisineIcon?: string | null;
  cuisineColor?: string | null;
}

/**
 * Per-cuisine stats response
 * Matches backend CuisineDetailStatsDto
 */
export interface CuisineDetailStatsResponse {
  cuisineName: string;
  totalMeals: number;
  uniqueDishes: number;
  totalCalories: number;
  averageCalories: number;
  firstMealAt: string;
  lastMealAt: string;
}

/**
 * Cuisines API endpoints
 */
export const cuisines = {
  /**
   * Get user cuisine stats
   * @returns Cuisine stats
   */
  getStats: async (): Promise<CuisineStatsResponse> => {
    return apiClient.get<CuisineStatsResponse>('/cuisines/stats');
  },

  /**
   * Get user unlocked cuisines
   * @returns Array of unlocked cuisines
   */
  getUnlocked: async (): Promise<CuisineUnlockResponse[]> => {
    return apiClient.get<CuisineUnlockResponse[]>('/cuisines/unlocked');
  },

  /**
   * Get stats for a specific cuisine
   * @param cuisineName - The name of the cuisine
   * @returns Per-cuisine stats including unique dish count
   */
  getCuisineStats: async (cuisineName: string): Promise<CuisineDetailStatsResponse> => {
    return apiClient.get<CuisineDetailStatsResponse>(`/cuisines/${encodeURIComponent(cuisineName)}/stats`);
  },
};
