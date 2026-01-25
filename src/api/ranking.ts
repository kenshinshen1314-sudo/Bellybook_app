/**
 * Ranking API
 *
 * API endpoints for ranking and leaderboard operations
 */

import { apiClient } from './client';
import type { ApiResponse } from './types';
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('RankingAPI');

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
 * Dish expert entry
 */
export interface DishExpertEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  dishCount: number;
  mealCount: number;
  dishes: string[];
  cuisines: string[];
}

/**
 * Dish experts response
 */
export interface DishExpertsResponse {
  period: string;
  experts: DishExpertEntry[];
}

/**
 * Cuisine expert dish entry
 */
export interface CuisineExpertDishEntry {
  dishName: string;
  cuisine: string;
  mealCount: number;
  firstMealAt: string;
  lastMealAt?: string;
  imageUrl?: string;
  calories?: number;
  notes?: string;
}

/**
 * Cuisine expert detail response
 */
export interface CuisineExpertDetailResponse {
  userId: string;
  username: string;
  avatarUrl: string | null;
  cuisineName: string;
  period: string;
  totalDishes: number;
  totalMeals: number;
  dishes: CuisineExpertDishEntry[];
}

/**
 * User cuisine stats entry
 * Shows dish count for each user+cuisine combination
 */
export interface UserCuisineStats {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  cuisineName: string;
  dishCount: number;
  mealCount: number;
  firstMealAt: string;
}

/**
 * All users dishes response
 * Returns flat list of user+cuisine combinations sorted by dish count
 */
export interface AllUsersDishesResponse {
  period: string;
  totalEntries: number;
  totalUsers: number;
  totalCuisines: number;
  entries: UserCuisineStats[];
}

/**
 * User unlocked dish entry
 */
export interface UnlockedDishEntry {
  dishName: string;
  cuisine: string;
  mealCount: number;
  firstMealAt: string;
  lastMealAt: string;
  imageUrl?: string;
  calories?: number;
}

/**
 * User unlocked dishes response
 */
export interface UserUnlockedDishesResponse {
  userId: string;
  username: string;
  avatarUrl: string | null;
  totalDishes: number;
  totalMeals: number;
  dishes: UnlockedDishEntry[];
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
    logger.debug('Fetching from /ranking/cuisine-masters with params:', params);
    const result = await apiClient.get<CuisineMastersResponse>('/ranking/cuisine-masters', { params });
    logger.debug('Result:', result);
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

  /**
   * Get dish experts ranking
   * @param period Time period (default: ALL_TIME)
   */
  getDishExperts: async (
    period: RankingPeriod = 'ALL_TIME'
  ): Promise<DishExpertsResponse> => {
    return apiClient.get<DishExpertsResponse>('/ranking/dish-experts', { params: { period } });
  },

  /**
   * Get cuisine expert detail
   * Shows all dishes for a specific user in a specific cuisine
   * @param userId User ID
   * @param cuisineName Cuisine name
   * @param period Time period (default: ALL_TIME)
   */
  getCuisineExpertDetail: async (
    userId: string,
    cuisineName: string,
    period: RankingPeriod = 'ALL_TIME'
  ): Promise<CuisineExpertDetailResponse> => {
    return apiClient.get<CuisineExpertDetailResponse>('/ranking/cuisine-expert-detail', {
      params: { userId, cuisineName, period }
    });
  },

  /**
   * Get all users dishes list
   * Shows all dishes grouped by user
   * @param period Time period (default: WEEKLY)
   * @param limit Maximum number of users to return (default: 1000 for all users)
   */
  getAllUsersDishes: async (
    period: RankingPeriod = 'WEEKLY',
    limit: number = 1000
  ): Promise<AllUsersDishesResponse> => {
    return apiClient.get<AllUsersDishesResponse>('/ranking/all-users-dishes', {
      params: { period, limit }
    });
  },

  /**
   * Get user unlocked dishes
   * Shows all dishes unlocked by a specific user
   * @param userId User ID
   */
  getUserUnlockedDishes: async (
    userId: string
  ): Promise<UserUnlockedDishesResponse> => {
    return apiClient.get<UserUnlockedDishesResponse>('/ranking/user-unlocked-dishes', {
      params: { userId }
    });
  },
};
