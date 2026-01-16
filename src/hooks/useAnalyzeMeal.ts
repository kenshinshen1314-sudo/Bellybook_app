import { useState, useCallback } from 'react';
import { analyzeFoodImage } from '@/services/geminiService';
import { Language, type AnalysisResult } from '@/types';
import { saveMeal as saveMealService } from '@/services/mealService';

export interface AnalyzeMealState {
  imageUrl: string | null;
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  isSaving: boolean;
  error: string | null;
  saveSuccess: boolean;
}

export interface AnalyzeMealResult {
  state: AnalyzeMealState;
  analyzeImage: (imageUrl: string, language: Language) => Promise<void>;
  saveAnalysis: (userId: string | null) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing meal analysis workflow
 * Note: userId is now passed during save, not during hook initialization
 */
export function useAnalyzeMeal(): AnalyzeMealResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  /**
   * Analyze a food image
   * @param imageUrl - Base64 data URL of the image
   * @param language - Language for analysis (Language.ZH or Language.EN)
   */
  const analyzeImage = useCallback(async (
    imageUrl: string,
    language: Language
  ): Promise<void> => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setSaveSuccess(false);
    setImageUrl(imageUrl);

    try {
      // Extract base64 data (remove data URL prefix)
      const base64Data = imageUrl.split(',')[1];

      // Call Gemini API for analysis
      const result = await analyzeFoodImage(base64Data, language);

      // Set analysis result (don't auto-save)
      setAnalysis({ ...result, imageUrl });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('[useAnalyzeMeal] Analysis error:', err);
      // Clear image URL on error
      setImageUrl(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Save the current analysis result
   * @param userId - The user ID to save the meal for (can be null for offline mode)
   */
  const saveAnalysis = useCallback(async (userId: string | null): Promise<void> => {
    console.log('[useAnalyzeMeal] saveAnalysis called with userId:', userId);
    if (!analysis || !imageUrl) {
      setError('No analysis to save');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Use the centralized meal service
      await saveMealService(userId, imageUrl, analysis);
      setSaveSuccess(true);
      console.log('[useAnalyzeMeal] Meal saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed';
      setError(errorMessage);
      console.error('[useAnalyzeMeal] Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [analysis, imageUrl]);

  /**
   * Reset the analysis state
   */
  const reset = useCallback(() => {
    setImageUrl(null);
    setAnalysis(null);
    setIsAnalyzing(false);
    setIsSaving(false);
    setError(null);
    setSaveSuccess(false);
  }, []);

  return {
    state: {
      imageUrl,
      analysis,
      isAnalyzing,
      isSaving,
      error,
      saveSuccess,
    },
    analyzeImage,
    saveAnalysis,
    reset,
  };
}

/**
 * Convenience function to handle file input change
 */
export async function handleFileSelect(
  file: File,
  analyzeFn: (imageUrl: string, language: Language) => Promise<void>,
  language: Language
): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        await analyzeFn(base64, language);
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
