import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Toast types with corresponding icons and colors
 */
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
  theme?: 'light' | 'dark';
}

/**
 * Individual Toast Component
 */
export function Toast({ toast, onClose, theme = 'dark' }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss after duration (default 3 seconds)
    const duration = toast.duration ?? 3000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: {
      bg: theme === 'dark' ? 'bg-green-900/90' : 'bg-green-50',
      border: theme === 'dark' ? 'border-green-700' : 'border-green-200',
      icon: 'text-green-500',
      title: theme === 'dark' ? 'text-green-100' : 'text-green-900',
      message: theme === 'dark' ? 'text-green-200' : 'text-green-700',
    },
    error: {
      bg: theme === 'dark' ? 'bg-red-900/90' : 'bg-red-50',
      border: theme === 'dark' ? 'border-red-700' : 'border-red-200',
      icon: 'text-red-500',
      title: theme === 'dark' ? 'text-red-100' : 'text-red-900',
      message: theme === 'dark' ? 'text-red-200' : 'text-red-700',
    },
    info: {
      bg: theme === 'dark' ? 'bg-blue-900/90' : 'bg-blue-50',
      border: theme === 'dark' ? 'border-blue-700' : 'border-blue-200',
      icon: 'text-blue-500',
      title: theme === 'dark' ? 'text-blue-100' : 'text-blue-900',
      message: theme === 'dark' ? 'text-blue-200' : 'text-blue-700',
    },
  };

  const colorScheme = colors[toast.type];

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: -50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      x: 100,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isExiting ? 'exit' : 'visible'}
      exit="exit"
      className={cn(
        'flex items-start space-x-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        colorScheme.bg,
        colorScheme.border,
        'min-w-[300px] max-w-md'
      )}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 mt-0.5', colorScheme.icon)}>
        {icons[toast.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={cn('font-semibold text-sm', colorScheme.title)}>
          {toast.title}
        </h4>
        {toast.message && (
          <p className={cn('text-sm mt-1', colorScheme.message)}>
            {toast.message}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(toast.id), 300);
        }}
        className={cn(
          'flex-shrink-0 p-1 rounded-lg transition-colors',
          theme === 'dark'
            ? 'hover:bg-white/10 text-white/70 hover:text-white'
            : 'hover:bg-black/5 text-gray-500 hover:text-gray-700'
        )}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

/**
 * ToastContainer Component - Manages stacking of multiple toasts
 */
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
  theme?: 'light' | 'dark';
}

export function ToastContainer({ toasts, onClose, theme = 'dark' }: ToastContainerProps) {
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end space-y-2 pointer-events-none safe-top">
      <AnimatePresence mode="popLayout">
        {toasts.length > 0 && (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-col space-y-2 pointer-events-auto"
          >
            {toasts.map((toast) => (
              <Toast key={toast.id} toast={toast} onClose={onClose} theme={theme} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
