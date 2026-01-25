/**
 * UserAvatar Component
 * 统一用户头像组件
 *
 * Displays user avatar with consistent styling across the application.
 * Shows actual image if available, otherwise shows a gradient placeholder
 * with the first character of the username.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { AVATAR_STYLES } from '@/styles/neumorphic';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface UserAvatarProps {
  /** Image URL for the avatar */
  src?: string | null;
  /** Username (used for fallback placeholder) */
  username?: string;
  /** Size variant */
  size?: AvatarSize | 'md';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Whether to show border */
  bordered?: boolean;
  /** Border color override */
  borderColor?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * Get the first character of username for fallback
 */
function getInitial(username?: string): string {
  if (!username) return '?';
  return username.charAt(0).toUpperCase();
}

/**
 * Get size classes for avatar
 */
function getSizeClasses(size: AvatarSize): string {
  const sizeMap: Record<AvatarSize, string> = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  };
  return sizeMap[size];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  username,
  size = 'md',
  className,
  onClick,
  bordered = false,
  borderColor,
  style
}) => {
  const sizeClasses = getSizeClasses(size as AvatarSize);
  const hasImage = !!src;

  const avatarContent = hasImage ? (
    <img
      src={src}
      alt={username || 'Avatar'}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-white font-bold">
      {getInitial(username)}
    </div>
  );

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-full overflow-hidden relative',
        sizeClasses,
        bordered && 'border-2',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        ...(hasImage ? {} : {
          background: AVATAR_STYLES.background,
          boxShadow: AVATAR_STYLES.boxShadow
        }),
        ...(bordered && { borderColor: borderColor || 'var(--foreground)' }),
        ...style
      }}
    >
      {avatarContent}
    </div>
  );
};

export default UserAvatar;
