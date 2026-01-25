/**
 * [INPUT]: 依赖 React 的 useState, useCallback
 * [OUTPUT]: 对外提供 useViewState Hook，管理视图级别的临时状态
 * [POS]: hooks/ 的视图状态管理层，管理 selectedCuisine、selectedDish、modal 等临时 UI 状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useCallback } from 'react';
import { AppView } from '@/types';

// ============================================================
// 类型定义
// ============================================================

interface ViewState {
  // 子视图选择状态
  selectedCuisine: string | null;
  selectedDish: string | null;
  selectedUser: any;

  // Modal 状态
  showLogoutModal: boolean;
  showConflictModal: boolean;
  showLimitOverlay: boolean;

  // Premium 状态
  isPremium: boolean;
  selectedPlan: 'monthly' | 'yearly';

  // 分析进度
  analysisProgress: number;
}

// ============================================================
// Hook
// ============================================================

/**
 * useViewState - 管理视图级别的临时状态
 *
 * 职责：
 * - 管理子视图的选中项（cuisine、dish、user）
 * - 管理 modal 显示状态
 * - 管理 premium 相关状态
 * - 管理 UI 临时状态
 *
 * 设计原则：
 * - 这些状态不需要持久化
 * - 页面刷新后可以重置
 * - 与全局业务状态分离
 */
export function useViewState() {
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
  // 导航操作
  // ============================================================

  /**
   * 导航到菜系详情
   */
  const navigateToCuisineDetail = useCallback((cuisine: string) => {
    setSelectedCuisine(cuisine);
    return AppView.PASSPORT_CUISINE_DETAIL;
  }, []);

  /**
   * 导航到菜品详情
   */
  const navigateToDishDetail = useCallback((dish: string) => {
    setSelectedDish(dish);
    return AppView.PASSPORT_DISH_DETAIL;
  }, []);

  /**
   * 导航到用户详情
   */
  const navigateToUserDetail = useCallback((user: any) => {
    setSelectedUser(user);
    return AppView.SOCIAL_USER_DETAIL;
  }, []);

  /**
   * 清除选择状态
   */
  const clearSelections = useCallback(() => {
    setSelectedCuisine(null);
    setSelectedDish(null);
    setSelectedUser(null);
  }, []);

  // ============================================================
  // 返回状态和操作
  // ============================================================
  return {
    // 状态
    selectedCuisine,
    selectedDish,
    selectedUser,
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

    // 操作
    navigateToCuisineDetail,
    navigateToDishDetail,
    navigateToUserDetail,
    clearSelections,
  };
}
