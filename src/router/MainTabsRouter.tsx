/**
 * [INPUT]: 依赖 contexts/AppContext 的 useApp, hooks/useTabSwipeNavigation, hooks/useScrollHide
 * [OUTPUT]: 对外提供 MainTabsRouter 组件，处理主标签页路由和滑动导航
 * [POS]: router/ 的主标签页路由器，被 AppRouter 消费，管理底部 Tab 和滑动切换
 * [PROTOCOL]: 变更时更新此头部，然后检查检查 ../CLAUDE.md
 */

import React, { Suspense, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useTabSwipeNavigation, useTabBarHide, springConfig, tabVariants, getSlideDirection } from '@/hooks/useSwipeNavigation';
import { PullToRefresh, useRefreshTimestamp } from '@/components/PullToRefresh';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { AnimatePresence, motion } from 'framer-motion';
import { AppView } from '@/types';
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('MainTabsRouter');

// Tab 组件
import { Tab1Home } from '@/views/tabs/Tab1Home';
import { Tab2History } from '@/views/tabs/Tab2History';
import { TabPassport } from '@/views/tabs/TabPassport';
import { Tab4Social } from '@/views/tabs/Tab4Social';

// ============================================================
// 加载状态
// ============================================================

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

// ============================================================
// MainTabsRouter
// ============================================================

/**
 * MainTabsRouter - 主标签页路由器
 *
 * 职责：
 * - 管理底部 4 个标签页的切换
 * - 处理滑动导航
 * - 处理下拉刷新
 * - 处理 TabBar 自动隐藏
 *
 * 依赖 useApp 获取：
 * - activeTab, setActiveTab
 * - language, theme, userId
 * - currentView, setCurrentView
 * - refreshTrigger
 * - navigateToProfile, navigateToPremium
 */
export function MainTabsRouter() {
  const {
    activeTab = 0,
    setCurrentView,
    language,
    theme,
    userId,
    refreshTrigger,
    user,
  } = useApp();

  // ============================================================
  // 本地状态（不属于全局状态）
  // ============================================================
  const [previousTab, setPreviousTab] = useState(0);

  // ============================================================
  // 自定义 Hooks
  // ============================================================

  // 滑动导航
  const { swipeHandlers, canSwipeLeft, canSwipeRight } = useTabSwipeNavigation({
    activeTab,
    tabCount: 4,
    onTabChange: (newTab) => {
      setPreviousTab(activeTab);
      // TODO: 更新 activeTab 到 context
    },
    threshold: 50,
  });

  // TabBar 自动隐藏
  const { isHidden: isTabBarHidden } = useTabBarHide({ threshold: 30, hideDelay: 150 });

  // 下拉刷新
  const { refresh } = useRefreshTimestamp();
  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  // ============================================================
  // 导航操作
  // ============================================================

  const handleTabChange = useCallback((newTab: number) => {
    setPreviousTab(activeTab);
    // TODO: 更新 activeTab 到 context
  }, [activeTab]);

  const handleCameraClick = useCallback(() => {
    setCurrentView(AppView.ANALYSIS_RESULT);
  }, [setCurrentView]);

  const navigateToProfile = useCallback(() => {
    setCurrentView(AppView.PROFILE_HOME);
  }, [setCurrentView]);

  const navigateToPremium = useCallback(() => {
    setCurrentView(AppView.PREMIUM_LANDING);
  }, [setCurrentView]);

  // ============================================================
  // 文本资源
  // ============================================================
  const t = {
    tab_home: language === 'zh' ? '首页' : 'Home',
    tab_passport: language === 'zh' ? '护照' : 'Passport',
    tab_data: language === 'zh' ? '数据' : 'Data',
    tab_social: language === 'zh' ? '社交' : 'Social',
    premium: language === 'zh' ? 'Premium' : 'Premium',
  };

  // ============================================================
  // 渲染
  // ============================================================

  return (
    <div className="min-h-screen relative bg-background text-foreground">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-[50px] z-40 flex items-center justify-between px-4 mt-safe-top bg-gradient-to-b from-background/80 to-transparent">
        {/* User Avatar */}
        <UserAvatar
          src={user?.avatarUrl}
          username={user?.username}
          size="md"
          onClick={navigateToProfile}
          className="cursor-pointer"
          style={{
            boxShadow: '0 4px 12px color-mix(in srgb, var(--foreground) 15%, transparent), inset 0 1px 0 color-mix(in srgb, var(--background) 80%, white), inset 0 -1px 0 color-mix(in srgb, var(--foreground) 5%, black)'
          }}
        />

        {/* Title */}
        <h1 className="text-lg font-bold tracking-wide">
          {activeTab === 0 ? t.tab_home :
            activeTab === 1 ? t.tab_passport :
              activeTab === 2 ? t.tab_data :
                t.tab_social}
        </h1>

        {/* Premium Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={navigateToPremium}
          className="flex items-center px-3 py-1.5 rounded-full border border-border bg-muted text-primary transition-all"
        >
          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center mr-2">
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          </div>
          <span className="text-xs font-semibold">{t.premium}</span>
        </motion.button>
      </div>

      {/* Tab Content with Swipe Navigation */}
      <div className="min-h-screen" {...swipeHandlers}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            custom={getSlideDirection(previousTab, activeTab)}
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={springConfig}
            className="min-h-screen"
          >
            <Suspense fallback={<LoadingFallback />}>
              {activeTab === 0 && (
                <PullToRefresh onRefresh={handleRefresh} language={language}>
                  <Tab1Home lang={language} theme={theme} refreshTrigger={refreshTrigger} userId={userId} />
                </PullToRefresh>
              )}
              {activeTab === 1 && (
                <PullToRefresh onRefresh={handleRefresh} language={language}>
                  <TabPassport
                    lang={language}
                    theme={theme}
                    refreshTrigger={refreshTrigger}
                    userId={userId}
                    onCuisineClick={(cuisine) => {
                      // TODO: navigate to cuisine detail
                      logger.debug('Navigate to cuisine:', cuisine);
                    }}
                  />
                </PullToRefresh>
              )}
              {activeTab === 2 && (
                <PullToRefresh onRefresh={handleRefresh} language={language}>
                  <Tab2History lang={language} isPremium={false} onUpgrade={navigateToPremium} theme={theme} refreshTrigger={refreshTrigger} userId={userId} />
                </PullToRefresh>
              )}
              {activeTab === 3 && (
                <PullToRefresh onRefresh={handleRefresh} language={language}>
                  <Tab4Social
                    lang={language}
                    theme={theme}
                    onExpertsClick={() => setCurrentView(AppView.SOCIAL_EXPERTS_LIST)}
                    onRankingClick={() => setCurrentView(AppView.SOCIAL_RANKING_LIST)}
                    userId={userId}
                  />
                </PullToRefresh>
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* TabBar */}
      <motion.div
        initial={false}
        animate={{ y: isTabBarHidden ? 100 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* TODO: 传入正确的 props */}
        {/* <TabBar activeTab={activeTab} onTabChange={handleTabChange} onCameraClick={handleCameraClick} lang={language} theme={theme} /> */}
      </motion.div>
    </div>
  );
}
