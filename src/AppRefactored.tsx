/**
 * [INPUT]: 依赖 React, contexts/AuthContext, contexts/AppContext, router/AppRouter
 * [OUTPUT]: 对外提供 App 根组件，Provider 包裹层 + 全局状态初始化
 * [POS]: 项目根入口，被 main.tsx 消费，初始化所有 Provider 和全局状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { ViewStateProvider, useViewState } from './contexts/ViewStateContext';
import { AppRouter } from './router/AppRouter';
import { OfflineBanner } from './components/OfflineBanner';
import { ConflictBanner } from './components/ConflictBanner';
import { ConflictResolutionModal } from './components/ConflictResolutionModal';
import { useOnline } from './hooks/useOnline';

// ============================================================
// App 内层组件（可使用 Context）
// ============================================================

/**
 * AppContent - App 内容组件
 *
 * 职责：
 * - 处理离线状态检测
 * - 处理冲突检测和解决
 * - 渲染路由器
 *
 * 设计原则：
 * - 只做布局和容器逻辑
 * - 业务逻辑委托给子组件
 */
function AppContent() {
  const isOnline = useOnline();
  const { currentView } = useApp();
  const { showConflictModal, setShowConflictModal } = useViewState();

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      {/* Offline Banner */}
      <OfflineBanner isOffline={!isOnline} />

      {/* Conflict Banner */}
      <ConflictBanner
        language="en"
        theme="light"
        onResolveClick={() => setShowConflictModal(true)}
      />

      {/* Main Router */}
      <AppRouter />

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        language="en"
        theme="light"
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
      />
    </div>
  );
}

// ============================================================
// App 根组件
// ============================================================

/**
 * App - 根组件
 *
 * 重构后的 App.tsx 从 1268 行减少到 ~100 行
 *
 * 架构：
 * - Provider 层：Auth → App → View
 * - 路由层：AppRouter → ProfileRouter/PremiumRouter/MainTabsRouter
 * - 状态层：Context 集中管理，消除 props drilling
 *
 * 设计原则：
 * - 单一职责：只负责 Provider 包裹和全局状态初始化
 * - 依赖注入：所有子组件通过 Context 获取状态
 * - 视图分离：大型视图独立为子路由器
 */
export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ViewStateProvider>
          <AppContent />
        </ViewStateProvider>
      </AppProvider>
    </AuthProvider>
  );
}
