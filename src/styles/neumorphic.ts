/**
 * Neumorphic Design System Style Constants
 * 微拟物设计系统样式常量
 *
 * Provides consistent gradient backgrounds and three-layer shadows
 * for neumorphic UI components throughout the application.
 */

/**
 * Avatar styles - 渐变背景头像样式
 * Used for user avatar placeholders when no image is available
 */
export const AVATAR_STYLES = {
  background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 100%)',
  boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
} as const;

/**
 * Avatar hover state - 头像悬停状态
 */
export const AVATAR_HOVER_STYLES = {
  boxShadow: '0 6px 20px color-mix(in srgb, var(--accent) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.15)'
} as const;

/**
 * Modal background - 模态框背景
 */
export const MODAL_STYLES = {
  background: 'var(--card)',
  borderColor: 'var(--border)'
} as const;

/**
 * Button styles - 按钮样式
 */
export const BUTTON_STYLES = {
  primary: {
    background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
  },
  gold: {
    background: 'var(--gold-gradient)',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--gold) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
  },
  destructive: {
    background: 'linear-gradient(135deg, var(--destructive) 0%, color-mix(in srgb, var(--destructive) 85%, black) 50%, color-mix(in srgb, var(--destructive) 70%, black) 100%)',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--destructive) 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
  }
} as const;

/**
 * Card styles - 卡片样式
 */
export const CARD_STYLES = {
  raised: {
    boxShadow: '0 2px 8px color-mix(in srgb, var(--foreground) 8%, transparent), inset 0 1px 0 color-mix(in srgb, var(--background) 80%, white), inset 0 -1px 0 color-mix(in srgb, var(--foreground) 3%, black)'
  },
  inset: {
    boxShadow: 'inset 0 2px 4px color-mix(in srgb, var(--foreground) 6%, transparent), inset 0 -1px 0 color-mix(in srgb, var(--background) 90%, white)'
  }
} as const;

/**
 * Size variants - 尺寸变体
 */
export const SIZE_VARIANTS = {
  avatar: {
    sm: 'w-8 h-8 text-sm' as const,
    md: 'w-12 h-12 text-lg' as const,
    lg: 'w-16 h-16 text-xl' as const,
    xl: 'w-20 h-20 text-2xl' as const
  }
} as const;

/**
 * Combine styles - 合并样式工具
 */
export function combineStyles(...styles: (string | undefined)[]): string {
  return styles.filter(Boolean).join(' ');
}
