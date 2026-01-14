import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '@/components/ui/toast';

interface ToastOptions {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
}

/**
 * Toast Hook - Provides toast notification functionality
 *
 * @example
 * const { toast, showSuccess, showError, showInfo } = useToast();
 *
 * showSuccess('Saved successfully');
 * showError('Failed to save', 'Please try again');
 * showInfo('New version available');
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Add a new toast notification
   */
  const toast = useCallback((options: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      id,
      type: options.type ?? 'info',
      title: options.title,
      message: options.message,
      duration: options.duration ?? 3000,
    };

    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  /**
   * Show a success toast
   */
  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      return toast({ title, message, type: 'success', duration });
    },
    [toast]
  );

  /**
   * Show an error toast
   */
  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      return toast({ title, message, type: 'error', duration });
    },
    [toast]
  );

  /**
   * Show an info toast
   */
  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      return toast({ title, message, type: 'info', duration });
    },
    [toast]
  );

  /**
   * Remove a toast by id
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Clear all toasts
   */
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    toast,
    showSuccess,
    showError,
    showInfo,
    removeToast,
    clearAll,
  };
}

/**
 * Toast Provider Context Type
 */
export interface ToastContextValue {
  toasts: Toast[];
  toast: (options: ToastOptions) => string;
  showSuccess: (title: string, message?: string, duration?: number) => string;
  showError: (title: string, message?: string, duration?: number) => string;
  showInfo: (title: string, message?: string, duration?: number) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}
