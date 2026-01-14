import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton Component - Loading placeholder with shimmer animation
 *
 * Variants:
 * - text: Single line text placeholder (default)
 * - circular: Circular avatar/icon placeholder
 * - rectangular: Rectangular card/image placeholder
 * - rounded: Rounded rectangle placeholder (similar to cards)
 *
 * Animation types:
 * - pulse: Fade in/out animation
 * - wave: Shimmer wave animation (default)
 * - none: No animation
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'wave',
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseStyles: string = 'bg-muted animate-shimmer';

  const variantStyles: Record<string, string> = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const animationStyles: Record<string, string> = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const inlineStyle: React.CSSProperties = {
    ...style,
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={inlineStyle}
      {...props}
    />
  );
}

/**
 * SkeletonText - Multi-line text skeleton
 */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Card-shaped skeleton with image and text
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      {/* Thumbnail */}
      <Skeleton variant="rounded" width={80} height={80} />

      {/* Content */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="text" className="w-1/3" />
      </div>
    </div>
  );
}

/**
 * SkeletonMealItem - Skeleton matching MealList item structure
 */
export function SkeletonMealItem({ className }: { className?: string }) {
  return (
    <div className={cn('p-3', className)}>
      <div className="flex items-center space-x-3">
        {/* Thumbnail */}
        <Skeleton variant="rounded" width={80} height={80} />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Food name */}
          <Skeleton variant="text" className="w-3/4 h-4" />

          {/* Cuisine */}
          <Skeleton variant="text" className="w-1/2 h-3" />

          {/* Nutrition & Time */}
          <div className="flex items-center space-x-3">
            <Skeleton variant="rectangular" width={60} height={12} />
            <Skeleton variant="rectangular" width={50} height={12} />
          </div>
        </div>

        {/* Chevron placeholder */}
        <Skeleton variant="circular" width={20} height={20} />
      </div>
    </div>
  );
}

/**
 * SkeletonStats - Skeleton matching NutritionCard stats structure
 */
export function SkeletonStats({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 space-y-4', className)}>
      {/* Header */}
      <Skeleton variant="text" className="w-1/2 h-5" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" className="w-1/2 h-3" />
            <Skeleton variant="text" className="w-3/4 h-6" />
            <Skeleton variant="rectangular" width="100%" height={8} />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="pt-4">
        <Skeleton variant="text" className="w-1/3 h-4 mb-3" />
        <Skeleton variant="rounded" width="100%" height={150} />
      </div>
    </div>
  );
}

/**
 * SkeletonAvatar - User avatar skeleton
 */
export function SkeletonAvatar({ size = 40, className }: { size?: number; className?: string }) {
  return <Skeleton variant="circular" width={size} height={size} className={className} />;
}

/**
 * SkeletonButton - Button-shaped skeleton
 */
export function SkeletonButton({ width = 120, height = 40, className }: { width?: number; height?: number; className?: string }) {
  return (
    <Skeleton variant="rounded" width={width} height={height} className={className} />
  );
}
