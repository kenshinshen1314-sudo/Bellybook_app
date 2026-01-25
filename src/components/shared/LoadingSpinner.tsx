/**
 * LoadingSpinner Component
 * 统一加载动画组件
 *
 * Provides consistent loading animation throughout the application.
 * Supports multiple sizes and color variants.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'primary' | 'accent' | 'gold' | 'white' | 'gray';

export interface LoadingSpinnerProps {
  /** Size variant */
  size?: SpinnerSize;
  /** Color variant */
  color?: SpinnerColor;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show in center of container */
  centered?: boolean;
}

const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-b-2',
  lg: 'h-12 w-12 border-b-3'
} as const;

const COLOR_CLASSES: Record<SpinnerColor, string> = {
  primary: 'border-primary border-l-transparent',
  accent: 'border-accent border-l-transparent',
  gold: 'border-amber-500 border-l-transparent',
  white: 'border-white border-l-transparent',
  gray: 'border-[var(--muted-foreground)] border-l-transparent'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  centered = false
}) => {
  const wrapper = (
    <div
      className={cn(
        'rounded-full animate-spin',
        SIZE_CLASSES[size],
        COLOR_CLASSES[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center py-12">
        {wrapper}
      </div>
    );
  }

  return wrapper;
};

/**
 * Full page loading overlay
 */
export interface LoadingOverlayProps {
  /** Whether to show the overlay */
  show?: boolean;
  /** Loading spinner color */
  color?: SpinnerColor;
  /** Background color */
  bgColor?: 'transparent' | 'light' | 'dark';
  /** Message to display below spinner */
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show = true,
  color = 'primary',
  bgColor = 'transparent',
  message
}) => {
  if (!show) return null;

  const bgClasses = {
    transparent: 'bg-transparent',
    light: 'bg-white/80',
    dark: 'bg-black/50'
  } as const;

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex flex-col items-center justify-center',
      bgClasses[bgColor]
    )}>
      <LoadingSpinner size="lg" color={color} />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
