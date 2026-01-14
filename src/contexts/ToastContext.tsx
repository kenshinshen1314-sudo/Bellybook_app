import React, { createContext, useContext, ReactNode } from 'react';
import { useToast, type ToastContextValue } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/toast';
import { Theme } from '@/types';

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * ToastProvider - Provides toast functionality to all child components
 *
 * Wrap your app with this provider to enable toast notifications:
 *
 * @example
 * <ToastProvider theme={theme}>
 *   <App />
 * </ToastProvider>
 */
export function ToastProvider({
  children,
  theme = 'dark',
}: {
  children: ReactNode;
  theme?: Theme;
}) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} theme={theme} />
    </ToastContext.Provider>
  );
}

/**
 * useToastContext - Access toast functionality from context
 *
 * This hook provides the same API as useToast but uses the shared context.
 *
 * @example
 * const { showSuccess, showError, showInfo } = useToastContext();
 *
 * showSuccess('Operation completed!');
 */
export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

/**
 * Convenience hook that re-exports useToastContext
 * Use this hook in components to show toast notifications
 */
export { useToastContext as useToastNotification };
