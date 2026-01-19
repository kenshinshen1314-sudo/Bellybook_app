/**
 * Ranking API
 *
 * API endpoints for ranking and leaderboard operations
 */

import { apiClient } from './client';
import type { ApiResponse } from './types';

/**
 * Ranking period type
 */
export type RankingPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL_TIME';

/**
 * Cuisine master entry
 */
export interface CuisineMasterEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  cuisineName: string;
  mealCount: number;
  firstMealAt: string;
}

/**
 * Cuisine masters response
 */
export interface CuisineMastersResponse {
  cuisineName?: string;
  period: string;
  masters: CuisineMasterEntry[];
}

/**
 * Gourmet entry
 */
export interface GourmetEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  cuisineCount: number;
  mealCount: number;
  cuisines: string[];
}

/**
 * Gourmets response
 */
export interface GourmetsResponse {
  period: string;
  gourmets: GourmetEntry[];
}

/**
 * Ranking stats response
 */
export interface RankingStatsResponse {
  period: string;
  totalUsers: number;
  activeUsers: number;
  totalMeals: number;
  totalCuisines: number;
  avgMealsPerUser: number;
}

/**
 * Ranking API endpoints
 */
export const ranking = {
  /**
   * Get cuisine masters ranking
   * @param cuisineName Optional cuisine name filter
   * @param period Time period (default: ALL_TIME)
   */
  getCuisineMasters: async (
    cuisineName?: string,
    period: RankingPeriod = 'ALL_TIME'
  ): Promise<CuisineMastersResponse> => {
    const params: Record<string, string> = { period };
    if (cuisineName) {
      params.cuisineName = cuisineName;
    }
    console.log('[ranking.getCuisineMasters] Fetching from /ranking/cuisine-masters with params:', params);
    const result = await apiClient.get<CuisineMastersResponse>('/ranking/cuisine-masters', { params });
    console.log('[ranking.getCuisineMasters] Result:', result);
    return result;
  },

  /**
   * Get gourmets ranking (users with most diverse cuisines)
   * @param period Time period (default: ALL_TIME)
   */
  getGourmets: async (
    period: RankingPeriod = 'ALL_TIME'
  ): Promise<GourmetsResponse> => {
    return apiClient.get<GourmetsResponse>('/ranking/gourmets', { params: { period } });
  },

  /**
   * Get ranking statistics
   * @param period Time period (default: ALL_TIME)
   */
  getStats: async (
    period: RankingPeriod = 'ALL_TIME'
  ): Promise<RankingStatsResponse> => {
    return apiClient.get<RankingStatsResponse>('/ranking/stats', { params: { period } });
  },
};
