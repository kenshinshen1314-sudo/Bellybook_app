/**
 * [INPUT]: 依赖 contexts/AppContext 的 useApp, hooks/useViewState, views/* 的所有视图组件
 * [OUTPUT]: 对外提供 AppRouter 组件，根据 currentView 渲染对应视图
 * [POS]: router/ 的视图路由层，被 App.tsx 消费，统一管理所有视图路由逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 ../CLAUDE.md
 */

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useViewState } from '@/hooks/useViewState';
import { AppView } from '@/types';

// ============================================================
// 视图组件导入
// ============================================================

// Router components
import { ProfileRouter } from '@/views/profile/ProfileRouter';
import { PremiumRouter } from '@/views/premium/PremiumRouter';
import { MainTabsRouter } from './MainTabsRouter';

// Auth 视图
import { LoginView, RegisterView } from '@/views/AuthViews';

// 主要视图
import { AnalysisResultView } from '@/views/AnalysisResultView';
import { DesignSystemView } from '@/views/DesignSystemView';

// Sub-views
import { CuisineDetail } from '@/views/subviews/CuisineDetail';
import { DishDetail } from '@/views/subviews/DishDetail';

// Social sub-views (lazy)
const LeaderboardPage = React.lazy(() => import('@/views/SocialSubViews').then(m => ({ default: m.LeaderboardPage })));
const UserDetailPage = React.lazy(() => import('@/views/SocialSubViews').then(m => ({ default: m.UserDetailPage })));

// ============================================================
// 加载状态组件
// ============================================================

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

// ============================================================
// 路由器组件
// ============================================================

/**
 * AppRouter - 视图路由器
 *
 * 根据 currentView 渲染对应视图组件
 * 每个视图直接从 useApp 和 useViewState 获取所需状态，无需 props 传递
 *
 * 设计原则：
 * - 单一职责：只负责路由分发
 * - 无 props drilling：所有状态通过 Context 获取
 * - 视图分离：大型视图（Profile、Premium）独立为子路由器
 */
export function AppRouter() {
  const { currentView, language, theme, userId, setCurrentView } = useApp();
  const {
    selectedCuisine,
    selectedDish,
    selectedUser,
    navigateToCuisineDetail,
    navigateToDishDetail,
    navigateToUserDetail,
  } = useViewState();

  // ============================================================
  // 文本资源
  // ============================================================
  const t = {
    cuisine_experts: language === 'zh' ? '菜系专家' : 'Cuisine Experts',
    gourmet_ranking: language === 'zh' ? '美食排行榜' : 'Gourmet Ranking',
  };

  // ============================================================
  // Auth Views
  // ============================================================
  if (currentView === AppView.AUTH_LOGIN) {
    return (
      <LoginView
        language={language}
        theme={theme}
        onBack={() => setCurrentView(AppView.MAIN_TABS)}
        onRegisterClick={() => setCurrentView(AppView.AUTH_REGISTER)}
        onLoginSuccess={() => setCurrentView(AppView.MAIN_TABS)}
      />
    );
  }

  if (currentView === AppView.AUTH_REGISTER) {
    return (
      <RegisterView
        language={language}
        theme={theme}
        onBack={() => setCurrentView(AppView.MAIN_TABS)}
        onLoginClick={() => setCurrentView(AppView.AUTH_LOGIN)}
        onRegisterSuccess={() => setCurrentView(AppView.MAIN_TABS)}
      />
    );
  }

  // ============================================================
  // Analysis View
  // ============================================================
  if (currentView === AppView.ANALYSIS_RESULT) {
    return (
      <AnalysisResultView
        uploadState={/* TODO: from UploadProvider */}
        analysisProgress={/* TODO: from ViewState */}
        language={language}
        mainBgClass="bg-background text-foreground"
        navigateBack={() => setCurrentView(AppView.MAIN_TABS)}
        resetUpload={() => {/* TODO */}}
      />
    );
  }

  // ============================================================
  // Social Sub-Views
  // ============================================================
  if (currentView === AppView.SOCIAL_EXPERTS_LIST) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LeaderboardPage
          title={t.cuisine_experts}
          type="experts"
          lang={language}
          theme={theme}
          onBack={() => setCurrentView(AppView.MAIN_TABS)}
          onUserClick={(user) => {
            navigateToUserDetail(user);
            setCurrentView(AppView.SOCIAL_USER_DETAIL);
          }}
          userId={userId}
        />
      </Suspense>
    );
  }

  if (currentView === AppView.SOCIAL_RANKING_LIST) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LeaderboardPage
          title={t.gourmet_ranking}
          type="ranking"
          lang={language}
          theme={theme}
          onBack={() => setCurrentView(AppView.MAIN_TABS)}
          onUserClick={(user) => {
            navigateToUserDetail(user);
            setCurrentView(AppView.SOCIAL_USER_DETAIL);
          }}
          userId={userId}
        />
      </Suspense>
    );
  }

  if (currentView === AppView.SOCIAL_USER_DETAIL) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <UserDetailPage
          user={selectedUser}
          lang={language}
          theme={theme}
          onBack={() => setCurrentView(AppView.MAIN_TABS)}
        />
      </Suspense>
    );
  }

  // ============================================================
  // Passport Sub-Views
  // ============================================================
  if (currentView === AppView.PASSPORT_CUISINE_DETAIL && selectedCuisine) {
    return (
      <CuisineDetail
        cuisine={selectedCuisine}
        lang={language}
        theme={theme}
        onBack={() => {
          setCurrentView(AppView.MAIN_TABS);
          // clearSelections();
        }}
        onDishClick={(dishName) => {
          navigateToDishDetail(dishName);
          setCurrentView(AppView.PASSPORT_DISH_DETAIL);
        }}
      />
    );
  }

  if (currentView === AppView.PASSPORT_DISH_DETAIL && selectedDish) {
    return (
      <DishDetail
        dishName={selectedDish}
        lang={language}
        theme={theme}
        onBack={() => {
          setCurrentView(AppView.PASSPORT_CUISINE_DETAIL);
          // clearSelections();
        }}
      />
    );
  }

  // ============================================================
  // Profile Views - 委托给子路由器
  // ============================================================
  if (currentView.startsWith('PROFILE')) {
    return <ProfileRouter />;
  }

  // ============================================================
  // Premium Views - 委托给子路由器
  // ============================================================
  if (currentView === AppView.PREMIUM_LANDING || currentView === AppView.PAYMENT_GATEWAY) {
    return <PremiumRouter />;
  }

  // ============================================================
  // Design System View
  // ============================================================
  if (currentView === AppView.DESIGN_SYSTEM) {
    return (
      <DesignSystemView
        language={language}
        theme={theme}
        onBack={() => setCurrentView(AppView.PROFILE_HOME)}
      />
    );
  }

  // ============================================================
  // Main Tabs (默认)
  // ============================================================
  return <MainTabsRouter />;
}
