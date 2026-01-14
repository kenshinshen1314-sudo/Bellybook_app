import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SafeAreaViewProps {
  children: ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  all?: boolean;
  mode?: 'padding' | 'margin';
}

/**
 * SafeAreaView Component - Handles safe area insets for notched devices
 * Automatically adds padding/margin based on safe area insets
 *
 * @example
 * <SafeAreaView top bottom>
 *   <YourContent />
 * </SafeAreaView>
 */
export function SafeAreaView({
  children,
  className,
  top = true,
  bottom = true,
  left = false,
  right = false,
  all = false,
  mode = 'padding',
}: SafeAreaViewProps) {
  const prefix = mode === 'padding' ? 'p' : 'm';

  const classes = cn(
    all && `safe-all`,
    !all && top && `${prefix}-safe-top`,
    !all && bottom && `${prefix}-safe-bottom`,
    !all && left && `${prefix}-safe-left`,
    !all && right && `${prefix}-safe-right`,
    className
  );

  return <div className={classes}>{children}</div>;
}

interface FixedSafeProps {
  children: ReactNode;
  className?: string;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}

/**
 * FixedSafe component - For fixed positioned elements with safe area insets
 * Uses CSS variables for positioning instead of padding
 *
 * @example
 * <FixedSafe top bottom className="fixed w-full z-50">
 *   <NavigationBar />
 * </FixedSafe>
 */
export function FixedSafe({
  children,
  className,
  top = true,
  bottom = true,
  left = true,
  right = true,
}: FixedSafeProps) {
  const style: React.CSSProperties = {};

  if (top) style.top = 'env(safe-area-inset-top)';
  if (bottom) style.bottom = 'env(safe-area-inset-bottom)';
  if (left) style.left = 'env(safe-area-inset-left)';
  if (right) style.right = 'env(safe-area-inset-right)';

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

interface SafeAreaHeightProps {
  children: ReactNode;
  className?: string;
  fullScreen?: boolean;
}

/**
 * SafeAreaHeight component - Container with height considering safe areas
 * Useful for full-screen modals and views
 *
 * @example
 * <SafeAreaHeight fullScreen>
 *   <FullPageModal />
 * </SafeAreaHeight>
 */
export function SafeAreaHeight({
  children,
  className,
  fullScreen = true,
}: SafeAreaHeightProps) {
  const height = fullScreen
    ? 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
    : 'calc(100% - env(safe-area-inset-top) - env(safe-area-inset-bottom))';

  return (
    <div className={className} style={{ height }}>
      {children}
    </div>
  );
}

/**
 * Hook to get safe area insets as values
 * Useful for programmatic calculations
 */
export function useSafeAreaInsets() {
  // In a real implementation, you might use a library like react-native-safe-area-context
  // For web, we use CSS env() variables, but this hook provides the CSS values
  const getInsets = () => {
    const styles = getComputedStyle(document.documentElement);
    return {
      top: styles.getPropertyValue('safe-area-inset-top') || '0px',
      bottom: styles.getPropertyValue('safe-area-inset-bottom') || '0px',
      left: styles.getPropertyValue('safe-area-inset-left') || '0px',
      right: styles.getPropertyValue('safe-area-inset-right') || '0px',
    };
  };

  return {
    top: 'env(safe-area-inset-top)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
    right: 'env(safe-area-inset-right)',
    getInsets,
  };
}

/**
 * Hook to check if device has notches (safe area insets > 0)
 */
export function useHasNotch() {
  // We can't directly check env() values in JS
  // This is a placeholder - in practice you'd check device dimensions
  // iPhone X has 244.4px width vs 375px for older iPhones
  const checkHasNotch = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Common notch device dimensions
    const iPhoneXWidth = 375;
    const iPhoneXHeight = 812;
    const notchThreshold = 810;

    // Check if dimensions match known notch devices
    return (
      (width === iPhoneXWidth && height >= notchThreshold) ||
      (height === iPhoneXWidth && width >= notchThreshold) ||
      // Other notch devices
      width >= 810 ||
      height >= 810
    );
  };

  return {
    hasNotch: checkHasNotch(),
    // Add more device-specific checks as needed
    isIPhoneX: checkHasNotch(),
  };
}
