/**
 * useAuthError Hook
 * Provides utilities for handling authentication errors in UI components
 */

import { useState, useCallback } from 'react';
import { AuthError, getErrorMessage, getErrorField } from '@/api/errors';

interface UseAuthErrorReturn {
  error: string;
  errorField: string | undefined;
  setError: (error: AuthError | Error | string | null) => void;
  clearError: () => void;
}

/**
 * Hook for managing authentication errors in forms
 */
export function useAuthError(): UseAuthErrorReturn {
  const [errorState, setErrorState] = useState<{
    message: string;
    field: string | undefined;
  }>({ message: '', field: undefined });

  const setError = useCallback((error: AuthError | Error | string | null) => {
    if (!error) {
      setErrorState({ message: '', field: undefined });
      return;
    }

    if (typeof error === 'string') {
      setErrorState({ message: error, field: undefined });
      return;
    }

    if (error instanceof AuthError) {
      setErrorState({
        message: getErrorMessage(error),
        field: getErrorField(error),
      });
      return;
    }

    // Generic Error
    setErrorState({ message: error.message, field: undefined });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ message: '', field: undefined });
  }, []);

  return {
    error: errorState.message,
    errorField: errorState.field,
    setError,
    clearError,
  };
}

/**
 * Get user-friendly error message based on error type
 */
export function getAuthErrorMessage(error: unknown, language: 'zh' | 'en' = 'en'): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (language === 'zh') {
    return '操作失败，请重试';
  }

  return 'Operation failed, please try again';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === 'object' && 'name' in error) {
    return error.name === 'NetworkError' || error.name === 'ApiRequestError';
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === 'object' && 'name' in error) {
    return error.name === 'ValidationError';
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === 'object' && 'name' in error) {
    return (
      error.name === 'InvalidCredentialsError' ||
      error.name === 'UnauthorizedError' ||
      error.name === 'TokenExpiredError'
    );
  }
  return false;
}
