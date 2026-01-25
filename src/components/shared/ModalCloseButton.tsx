/**
 * ModalCloseButton Component
 * 统一模态框关闭按钮组件
 *
 * Provides consistent close button styling for all modal dialogs.
 * Uses theme-aware colors and includes hover/active micro-interactions.
 */

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Theme } from '@/types';

export interface ModalCloseButtonProps {
  /** Click handler */
  onClose: () => void;
  /** Current theme */
  theme?: Theme;
  /** Additional CSS classes */
  className?: string;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Position in modal (affects z-index) */
  absolute?: boolean;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
} as const;

const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 24
} as const;

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClose,
  theme = 'light',
  className,
  size = 'md',
  absolute = false
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onClose}
      className={cn(
        'rounded-full flex items-center justify-center transition-all',
        'hover:scale-[1.02] active:scale-[0.98]',
        SIZE_CLASSES[size],
        isDark
          ? 'bg-[#2C2C2E] hover:bg-[#3C3C3E] text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
        absolute && 'absolute top-4 right-4 z-50',
        className
      )}
      aria-label="Close"
    >
      <X size={ICON_SIZES[size]} />
    </button>
  );
};

export default ModalCloseButton;
