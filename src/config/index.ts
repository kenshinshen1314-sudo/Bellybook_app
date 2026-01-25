/**
 * App Configuration
 * Centralized configuration from environment variables
 */

import { logger } from '@/utils/logger';

// Daily meal analysis limit for free users
export const DAILY_ANALYSIS_LIMIT = parseInt(
  import.meta.env.VITE_DISHES_ANALYSIS_NUM || '10',
  10
);

// Gemini API Key (exported for services that need it)
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Validate configuration on load
if (import.meta.env.DEV) {
  if (!GEMINI_API_KEY) {
    logger.warn('VITE_GEMINI_API_KEY is not set');
  }
  if (DAILY_ANALYSIS_LIMIT < 1) {
    logger.warn('VITE_DISHES_ANALYSIS_NUM must be at least 1, using default of 10');
  }
}

export default {
  DAILY_ANALYSIS_LIMIT,
  GEMINI_API_KEY,
};
