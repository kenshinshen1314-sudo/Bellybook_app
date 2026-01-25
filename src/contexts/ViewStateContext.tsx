/**
 * [INPUT]: 依赖 React 的 createContext, useContext, useState
 * [OUTPUT]: 对外提供 ViewStateProvider, useViewState Hook
 * [POS]: contexts/ 的视图状态管理层，管理 selectedCuisine、selectedDish 等临时 UI 状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 ../CLAUDE.md
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AppView } from '@/types';

// ============================================================
// 类型定义
// ============================================================

interface ViewStateContextValue {
  // 选择状态
  selectedCuisine: string | null;
  setSelectedCuisine: (cuisine: string | null) => void;
  selectedDish: string | null;
  setSelectedDish: (dish: string | null) => void;
  selectedUser: any;
  setSelectedUser: (user: any) => void;

  // Modal 状态
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  showConflictModal: boolean;
  setShowConflictModal: (show: boolean) => void;
  showLimitOverlay: boolean;
  setShowLimitOverlay: (show: boolean) => void;

  // Premium 状态
  isPremium: boolean;
  setIsPremium: (premium: boolean) => void;
  selectedPlan: 'monthly' | 'yearly';
  setSelectedPlan: (plan: 'monthly' | 'yearly') => void;

  // 分析进度
  analysisProgress: number;
  setAnalysisProgress: (progress: number) => void;

  // Tab 状态
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

const ViewStateContext = createContext<ViewStateContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

interface ViewStateProviderProps {
  children: ReactNode;
}

/**
 * ViewStateProvider - 视图状态管理
 *
 * 管理视图级别的临时状态：
 * - 子视图的选择项（cuisine、dish、user）
 * - Modal 显示状态
 * - Premium 相关状态
 * - Tab 切换状态
 *
 * 设计原则：
 * - 这些状态不需要持久化
 * - 页面刷新后可以重置
 * - 与全局业务状态分离
 */
export function ViewStateProvider({ children }: ViewStateProviderProps) {
  // ============================================================
  // 选择状态
  // ============================================================
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // ============================================================
  // Modal 状态
  // ============================================================
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showLimitOverlay, setShowLimitOverlay] = useState(false);

  // ============================================================
  // Premium 状态
  // ============================================================
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  // ============================================================
  // 分析进度
  // ============================================================
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // ============================================================
  // Tab 状态
  // ============================================================
  const [activeTab, setActiveTab] = useState(0);

  const value: ViewStateContextValue = {
    selectedCuisine,
    setSelectedCuisine,
    selectedDish,
    setSelectedDish,
    selectedUser,
    setSelectedUser,
    showLogoutModal,
    setShowLogoutModal,
    showConflictModal,
    setShowConflictModal,
    showLimitOverlay,
    setShowLimitOverlay,
    isPremium,
    setIsPremium,
    selectedPlan,
    setSelectedPlan,
    analysisProgress,
    setAnalysisProgress,
    activeTab,
    setActiveTab,
  };

  return <ViewStateContext.Provider value={value}>{children}</ViewStateContext.Provider>;
}

// ============================================================
// Hook
// ============================================================

/**
 * useViewState - 获取视图状态
 * @throws Error 如果在 Provider 外部使用
 */
export function useViewState(): ViewStateContextValue {
  const ctx = useContext(ViewStateContext);
  if (!ctx) {
    throw new Error('useViewState must be used within ViewStateProvider');
  }
  return ctx;
}
