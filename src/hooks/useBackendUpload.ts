import { useState, useCallback } from 'react';
import { storage, type UploadWithAnalysisResponse, type FoodAnalysisResult } from '@/api/storage';
import { ApiRequestError } from '@/api/client';
import type { AnalysisResult } from '@/types';

export interface BackendUploadState {
  imageUrl: string | null;
  analysis: AnalysisResult | null;
  isUploading: boolean;
  error: string | null;
  quotaExceeded: boolean;
  quotaInfo?: {
    limit: number;
    remaining: number;
  };
}

export interface BackendUploadResult {
  state: BackendUploadState;
  uploadWithAnalysis: (file: File) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for uploading images to backend with AI analysis
 *
 * This hook:
 * 1. Uploads image to backend
 * 2. Backend stores image in Supabase Storage
 * 3. Backend performs AI analysis
 * 4. Backend creates meal record in Supabase
 * 5. Returns complete results
 *
 * Replaces the client-side Gemini analysis with backend-powered analysis
 */
export function useBackendUpload(): BackendUploadResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<{ limit: number; remaining: number } | undefined>();

  /**
   * Upload image and get AI analysis from backend
   *
   * @param file - The image file to upload
   */
  const uploadWithAnalysis = useCallback(async (file: File): Promise<void> => {
    setIsUploading(true);
    setError(null);
    setQuotaExceeded(false);
    setQuotaInfo(undefined);
    setAnalysis(null);

    // Immediately show the local image as base64 for better UX
    try {
      const localImageUrl = await fileToBase64(file);
      setImageUrl(localImageUrl);
    } catch (err) {
      console.error('[useBackendUpload] Failed to read local file:', err);
      // Continue anyway, backend upload will work
    }

    try {
      // Call backend API for upload + analysis
      const result: UploadWithAnalysisResponse = await storage.uploadWithAnalysis(file);

      // Extract data from response
      const { upload, analysis: backendAnalysis, meal, quota } = result;

      // Store quota info
      setQuotaInfo(quota);

      // Convert backend analysis to frontend format
      const frontendAnalysis: AnalysisResult = {
        foodName: backendAnalysis.foodName,
        cuisine: backendAnalysis.cuisine,
        plating: backendAnalysis.plating,
        sensory: backendAnalysis.sensory,
        container: backendAnalysis.container,
        description: backendAnalysis.description,
        nutrition: backendAnalysis.nutrition,
        ingredients: backendAnalysis.ingredients,
        suggestions: backendAnalysis.suggestions,
        dishSuggestion: backendAnalysis.dishSuggestion,
        poeticDescription: backendAnalysis.poeticDescription,
        nutritionCommentary: backendAnalysis.nutritionCommentary,
        imageUrl: upload.url,
      };

      // Update state with server URL (replaces local base64)
      setImageUrl(upload.url);
      setAnalysis(frontendAnalysis);

      console.log('[useBackendUpload] Upload successful:', {
        imageUrl: upload.url,
        mealId: meal.id,
        quota: quota,
      });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        // Handle quota exceeded error
        if (err.code === 'QUOTA_EXCEEDED') {
          setQuotaExceeded(true);
          setQuotaInfo(err.details as { limit: number; remaining: number });
          setError(err.message);
        } else {
          setError(err.message);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
      }
      console.error('[useBackendUpload] Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Reset the state
   */
  const reset = useCallback(() => {
    setImageUrl(null);
    setAnalysis(null);
    setIsUploading(false);
    setError(null);
    setQuotaExceeded(false);
    setQuotaInfo(undefined);
  }, []);

  return {
    state: {
      imageUrl,
      analysis,
      isUploading,
      error,
      quotaExceeded,
      quotaInfo,
    },
    uploadWithAnalysis,
    reset,
  };
}

/**
 * Helper function to convert File to base64 (for fallback/compatibility)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
