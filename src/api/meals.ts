/**
 * Meals API
 *
 * API endpoints for meal CRUD operations
 */

import { apiClient } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  CreateMealDto,
  UpdateMealDto,
  MealResponse,
  PaginationParams,
} from './types';

/**
 * Meals API endpoints
 */
export const meals = {
  /**
   * Get all meals for the current user
   */
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<MealResponse>> => {
    return apiClient.get<PaginatedResponse<MealResponse>>('/meals', { params });
  },

  /**
   * Get a single meal by ID
   */
  getById: async (mealId: string): Promise<ApiResponse<MealResponse>> => {
    return apiClient.get<ApiResponse<MealResponse>>(`/meals/${mealId}`);
  },

  /**
   * Create a new meal
   */
  create: async (data: CreateMealDto): Promise<ApiResponse<MealResponse>> => {
    return apiClient.post<ApiResponse<MealResponse>>('/meals', data);
  },

  /**
   * Update an existing meal
   */
  update: async (mealId: string, data: UpdateMealDto): Promise<ApiResponse<MealResponse>> => {
    return apiClient.patch<ApiResponse<MealResponse>>(`/meals/${mealId}`, data);
  },

  /**
   * Delete a meal
   */
  delete: async (mealId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/meals/${mealId}`);
  },

  /**
   * Get meals by date range
   */
  getByDateRange: async (
    startDate: string,
    endDate: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<MealResponse>> => {
    return apiClient.get<PaginatedResponse<MealResponse>>('/meals/by-date-range', {
      params: { startDate, endDate, ...params },
    });
  },

  /**
   * Get today's meals
   */
  getToday: async (): Promise<PaginatedResponse<MealResponse>> => {
    return apiClient.get<PaginatedResponse<MealResponse>>('/meals/today');
  },

  /**
   * Upload meal image
   */
  uploadImage: async (file: File): Promise<ApiResponse<{ imageUrl: string }>> => {
    const formData = new FormData();
    formData.append('image', file);

    // Use fetch directly for multipart/form-data
    const response = await fetch(`/api/v1/meals/upload-image`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        ...(apiClient as any).tokenManager?.getAccessToken()
          ? { Authorization: `Bearer ${(apiClient as any).tokenManager.getAccessToken()}` }
          : {},
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    return response.json();
  },
};
