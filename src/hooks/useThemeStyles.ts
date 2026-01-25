/**
 * [INPUT]: 依赖 React 的 useMemo, types 的 Theme
 * [OUTPUT]: 对外提供 useThemeStyles Hook，返回主题相关的样式类名
 * [POS]: hooks/ 的主题样式管理层，被所有需要主题样式的组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useMemo } from 'react';
import { Theme } from '@/types';

// ============================================================
// 类型定义
// ============================================================

interface ThemeStyles {
  // 文本颜色
  textTitle: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;

  // 背景颜色
  bgPrimary: string;
  bgSecondary: string;
  bgMuted: string;
  bgCard: string;

  // 边框颜色
  border: string;
  borderLight: string;

  // 按钮样式
  buttonPrimary: string;
  buttonSecondary: string;
  buttonOutline: string;

  // 输入框样式
  inputBg: string;
  inputBorder: string;

  // 状态颜色
  success: string;
  error: string;
  warning: string;
}

// ============================================================
// Hook
// ============================================================

/**
 * useThemeStyles - 获取主题相关的样式类名
 *
 * 职责：
 * - 提供统一的主题样式类名
 * - 消除组件中重复的主题判断代码
 * - 使用 CSS 变量而非硬编码颜色
 *
 * 设计原则：
 * - 优先使用 CSS 变量
 * - 减少 if/else 分支
 * - 保持 API 简洁
 *
 * @example
 * ```tsx
 * function MyComponent({ theme }: { theme: Theme }) {
 *   const styles = useThemeStyles(theme);
 *   return <div className={styles.textTitle}>Title</div>;
 * }
 * ```
 */
export function useThemeStyles(theme: Theme): ThemeStyles {
  return useMemo(() => ({
    // ============================================================
    // 文本颜色 - 使用 CSS 变量
    // ============================================================
    textTitle: 'text-[var(--foreground)]',
    textSecondary: 'text-[var(--muted-foreground)]',
    textTertiary: 'text-[var(--muted-foreground)]',
    textMuted: 'text-[var(--muted-foreground)]',

    // ============================================================
    // 背景颜色 - 使用 CSS 变量
    // ============================================================
    bgPrimary: 'bg-[var(--background)]',
    bgSecondary: 'bg-[var(--secondary)]',
    bgMuted: 'bg-[var(--muted)]',
    bgCard: 'bg-[var(--card)]',

    // ============================================================
    // 边框颜色 - 使用 CSS 变量
    // ============================================================
    border: 'border-[var(--border)]',
    borderLight: theme === 'dark' ? 'border-white/10' : 'border-black/5',

    // ============================================================
    // 按钮样式
    // ============================================================
    buttonPrimary: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    buttonSecondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
    buttonOutline: 'border-2 border-[var(--border)] text-[var(--foreground)]',

    // ============================================================
    // 输入框样式
    // ============================================================
    inputBg: 'bg-[var(--input)]',
    inputBorder: 'border-[var(--input)]',

    // ============================================================
    // 状态颜色 - 使用 CSS 变量
    // ============================================================
    success: 'text-[var(--success)]',
    error: 'text-[var(--destructive)]',
    warning: 'text-[var(--warning)]',
  }), [theme]);
}

/**
 * useThemeValue - 获取单个主题值（用于特殊情况）
 *
 * 当需要更细粒度的控制时使用
 *
 * @example
 * ```tsx
 * const textColor = useThemeValue(theme, 'foreground');
 * return <div style={{ color: textColor }}>Text</div>;
 * ```
 */
export function useThemeValue(theme: Theme, key: string): string {
  return useMemo(() => {
    const cssVar = `var(--${key})`;
    return cssVar;
  }, [theme, key]);
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 判断是否为暗色主题
 */
export function isDarkTheme(theme: Theme): boolean {
  return theme === 'dark';
}

/**
 * 获取主题对应的文本颜色类名（兼容旧代码）
 *
 * @deprecated 推荐使用 useThemeStyles() Hook
 */
export function getTextColorClass(theme: Theme, type: 'title' | 'secondary' | 'tertiary'): string {
  switch (type) {
    case 'title':
      return theme === 'dark' ? 'text-white' : 'text-gray-900';
    case 'secondary':
      return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    case 'tertiary':
      return 'text-gray-500';
    default:
      return theme === 'dark' ? 'text-white' : 'text-gray-900';
  }
}

/**
 * 获取主题对应的背景颜色类名（兼容旧代码）
 *
 * @deprecated 推荐使用 useThemeStyles() Hook
 */
export function getBgColorClass(theme: Theme, type: 'card' | 'secondary' | 'muted'): string {
  switch (type) {
    case 'card':
      return theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';
    case 'secondary':
      return theme === 'dark' ? 'bg-[#2C2C2E]' : 'bg-gray-100';
    case 'muted':
      return theme === 'dark' ? 'bg-[#3C3C3E]' : 'bg-gray-50';
    default:
      return theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';
  }
}
