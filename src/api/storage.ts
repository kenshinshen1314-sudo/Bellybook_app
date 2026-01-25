/**
 * Storage API
 *
 * API client for image upload with AI analysis
 * Calls backend /api/v1/storage/upload-with-analysis endpoint
 */

import { apiClient, tokenManager, API_BASE_URL, ApiRequestError } from './client';
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('StorageAPI');

/**
 * Food analysis result from backend AI
 */
export interface FoodAnalysisResult {
  foodName: string;
  cuisine?: string;
  plating?: string;
  sensory?: string;
  container?: string;
  description?: string;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  ingredients?: Array<{
    name: string;
    percentage: number;
    icon?: string;
    description?: string;
  }>;
  suggestions?: string[];
  dishSuggestion?: string;
  poeticDescription?: string;
  nutritionCommentary?: string;
  foodPrice?: number;
  historicalOrigins?: string;
}

/**
 * Upload result from backend
 */
export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  key: string;
  size: number;
}

/**
 * Quota information
 */
export interface QuotaInfo {
  limit: number;
  remaining: number;
}

/**
 * Response from upload-with-analysis endpoint
 */
export interface UploadWithAnalysisResponse {
  upload: UploadResult;
  analysis: FoodAnalysisResult;
  meal: {
    id: string;
    userId: string;
    imageUrl: string;
    thumbnailUrl: string;
    analysis: FoodAnalysisResult;
    mealType: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  };
  quota: QuotaInfo;
}

/**
 * Storage API - handles image upload with AI analysis
 */
export const storage = {
  /**
   * Upload image with AI analysis
   * This endpoint:
   * 1. Uploads image to Supabase Storage
   * 2. Analyzes food using AI
   * 3. Creates meal record in Supabase
   * 4. Returns complete results
   *
   * @param file - The image file to upload
   * @returns Promise with upload result, analysis, and meal record
   * @throws ApiRequestError if upload fails or quota exceeded
   */
  uploadWithAnalysis: async (file: File): Promise<UploadWithAnalysisResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    // Get current access token for authentication
    const token = tokenManager.getAccessToken();

    const url = `${API_BASE_URL}/storage/upload-with-analysis`;

    logger.debug('Uploading to:', url);
    logger.debug('File size:', file.size, 'bytes');
    logger.debug('Has token:', !!token);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData, browser will set it with boundary
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      logger.debug('Response status:', response.status, response.statusText);
    } catch (networkError) {
      logger.error('Network error:', networkError);
      throw new ApiRequestError(
        `Network error: ${networkError instanceof Error ? networkError.message : 'Unknown error'}`,
        0,
        'NETWORK_ERROR',
        { originalError: networkError }
      );
    }

    if (!response.ok) {
      // Handle quota exceeded error (429)
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiRequestError(
          errorData.message || 'Daily analysis quota exceeded',
          429,
          'QUOTA_EXCEEDED',
          errorData.quota
        );
      }

      // Handle other errors
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiRequestError(
        errorData.message || `Failed to upload image: ${response.statusText}`,
        response.status,
        errorData.error
      );
    }

    return response.json();
  },

  /**
   * Simple image upload without analysis
   * Use this if you just want to upload an image
   *
   * @param file - The image file to upload
   * @returns Promise with upload result
   */
  uploadImage: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = tokenManager.getAccessToken();

    const response = await fetch(`${API_BASE_URL}/storage/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiRequestError(
        errorData.message || `Failed to upload image: ${response.statusText}`,
        response.status
      );
    }

    return response.json();
  },
};

/**
 * Re-export types
 */
export type { FoodAnalysisResult, UploadResult, QuotaInfo, UploadWithAnalysisResponse };
