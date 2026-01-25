/**
 * [INPUT]: 依赖 contexts/AppContext 的 useApp, components/UIComponents 的 UI 组件
 * [OUTPUT]: 对外提供 ProfileRouter 组件，处理所有 PROFILE_* 视图路由
 * [POS]: views/profile/ 的 Profile 视图路由器，被 AppRouter 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 ../../CLAUDE.md
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, LogOut, Cloud, Palette, Share2, Star, MessageSquare, ArrowLeft, Crown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useViewState } from '@/hooks/useViewState';
import { useUserUnlockedDishes } from '@/hooks/useUserUnlockedDishes';
import { useBackendMeals } from '@/hooks/useBackendMeals';
import { useMeals } from '@/hooks/useMeals';
import { cuisines, type CuisineStatsResponse } from '@/api/cuisines';
import { logger } from '@/utils/logger';
import { NavBar, ListItem, ToggleItem } from '@/components/UIComponents';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ProfileEdit } from '@/components/ProfileEdit';
import { TimePicker } from '@/components/TimePicker';
import { SyncStatus } from '@/components/SyncStatus';
import { AppView, Language } from '@/types';
import { logger } from '@/utils/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api';
import { cn } from '@/lib/utils';

// ============================================================
// Profile 子视图组件
// ============================================================

/**
 * ProfileHome - Profile 主页
 */
function ProfileHome() {
  const { userId, user, profile, theme, language, navigateToPremium } = useApp();
  const { setShowLogoutModal } = useViewState();

  // 立即打印 - 组件已渲染
  console.log('[ProfileHome] Component rendered! userId:', userId);

  // 使用 useUserUnlockedDishes hook 获取统计数据
  // 注意：只在有真实 userId 时调用，'current-user' 会导致后端返回"用户不存在"
  const { data: statsData, isLoading: statsLoading } = useUserUnlockedDishes(userId);

  // 菜系统计数据 - 从后端 API 获取
  const [cuisineStats, setCuisineStats] = useState<CuisineStatsResponse | null>(null);
  const [cuisineStatsLoading, setCuisineStatsLoading] = useState(false);

  // 获取本地餐食数据（备用方案，用于离线模式）
  const { meals: localMeals } = useMeals();

  // 调用后端 API 获取菜系统计
  useEffect(() => {
    const fetchCuisineStats = async () => {
      // Skip for 'current-user' or empty userId - backend doesn't recognize it
      if (!userId || userId === 'current-user') {
        logger.warn('[ProfileHome] Skipping cuisine stats API - userId is offline user:', userId);
        return;
      }

      try {
        setCuisineStatsLoading(true);
        logger.debug('[ProfileHome] Fetching cuisine stats from API for userId:', userId);
        const stats = await cuisines.getStats();
        setCuisineStats(stats);
        logger.debug('[ProfileHome] Cuisine stats received from API:', {
          userId,
          totalUnlocked: stats.totalUnlocked,
          totalAvailable: stats.totalAvailable,
          topCuisines: stats.topCuisines
        });
      } catch (error) {
        logger.error('[ProfileHome] Failed to fetch cuisine stats from API:', error);
      } finally {
        setCuisineStatsLoading(false);
      }
    };

    fetchCuisineStats();
  }, [userId]);

  // 添加调试日志
  useEffect(() => {
    logger.debug('[ProfileHome] Component state:', {
      userId,
      hasStatsData: !!statsData,
      totalDishes: statsData?.totalDishes,
      totalMeals: statsData?.totalMeals,
      cuisineStatsTotalUnlocked: cuisineStats?.totalUnlocked,
      localMealsCount: localMeals.length
    });
  }, [statsData, userId, cuisineStats, localMeals.length]);

  // 添加全局测试函数 - 用于调试
  useEffect(() => {
    (window as any).testCuisinesAPI = async () => {
      logger.info('[TEST] Calling cuisines.getStats()...');
      try {
        const result = await cuisines.getStats();
        logger.info('[TEST] Success! Result:', result);
        return result;
      } catch (error) {
        logger.error('[TEST] Error:', error);
        throw error;
      }
    };
    logger.info('[ProfileHome] Debug: Type testCuisinesAPI() in console to test API');
  }, []);

  const t = { /* TODO: from TEXT */ };

  // 计算统计 - 使用 API 返回的正确字段，或本地数据作为备用
  // totalDishes: 唯一菜品数量, totalMeals: 总餐数
  const statsDishCount = statsData?.totalDishes ?? 0;
  const statsMealCount = statsData?.totalMeals ?? localMeals.length;

  // 从后端 API 获取准确的菜系数量
  const statsCuisineCount = cuisineStats?.totalUnlocked ?? 0;

  return (
    <div className="animate-fade-in">
      {/* Header Image */}
      <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: 'url(https://picsum.photos/800/600?food)' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90" />
        <div className="absolute bottom-4 left-4 flex items-end">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mr-4"
          >
            <Avatar className="h-20 w-20 border-4 border-white/30 shadow-xl">
              <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-white">
              {profile?.displayName || user?.displayName || 'User'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-white/70">
                @{user?.username || 'guest'}
              </p>
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30">
                Free
              </Badge>
            </div>
            {profile?.bio && (
              <p className="text-sm text-white/80 mt-2 max-w-xs">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-6">
        {/* Stats - 使用 Badge 组件 */}
        <div className="flex justify-between items-center px-2">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="border-[var(--border)]">
              {statsMealCount} {language === Language.ZH ? '餐' : 'meals'}
            </Badge>
            <Badge variant="outline" className="border-[var(--border)]">
              {statsDishCount} {language === Language.ZH ? '菜品' : 'dishes'}
            </Badge>
            <Badge variant="outline" className="border-[var(--border)]">
              {statsCuisineCount} {language === Language.ZH ? '菜系' : 'cuisines'}
            </Badge>
          </div>
          <Badge
            variant="default"
            className="cursor-pointer bg-gradient-to-r from-[var(--gold-light)] to-[var(--gold)] text-black border-0 hover:opacity-90"
            onClick={navigateToPremium}
          >
            <Crown className="w-3 h-3 mr-1" />
            Unlock Premium
          </Badge>
        </div>

        {/* Account Section */}
        <div className="space-y-1">
          <h3 className="text-xs text-muted-foreground ml-4 mb-2">Account</h3>
          <div className="bg-card rounded-xl overflow-hidden">
            <ListItem theme={theme} label="Edit Profile" onClick={() => {/* TODO */}} />
            <ListItem theme={theme} label="Subscribe Monthly" onClick={navigateToPremium} />
          </div>
        </div>

        {/* Settings Section */}
        <div className="space-y-1">
          <h3 className="text-xs text-muted-foreground ml-4 mb-2">Settings</h3>
          <div className="bg-card rounded-xl overflow-hidden">
            <ListItem theme={theme} label="Appearance" onClick={() => {/* TODO */}} />
            <ListItem theme={theme} label="Language" value={language === 'en' ? 'English' : '简体中文'} onClick={() => {/* TODO */}} />
            <ListItem theme={theme} label="Notifications" onClick={() => {/* TODO */}} />
            <ListItem theme={theme} label="Privacy" onClick={() => {/* TODO */}} />
            <ListItem theme={theme} label="Data Sync" icon={<Cloud size={16} />} onClick={() => {/* TODO */}} />
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-1">
          <h3 className="text-xs text-muted-foreground ml-4 mb-2">Info</h3>
          <div className="bg-card rounded-xl overflow-hidden">
            <ListItem theme={theme} label="About 2.0" icon={<div className="w-5 h-5 rounded-full border border-[var(--muted-foreground)]/30 flex items-center justify-center text-[10px]">i</div>} />
            <ListItem theme={theme} label="Design System" icon={<Palette size={16} />} onClick={() => {/* TODO */}} />
            <ListItem theme={theme} label="Share with Friends" icon={<Share2 size={16} />} />
            <ListItem theme={theme} label="Rate App" icon={<Star size={16} />} />
            <ListItem theme={theme} label="Feedback" icon={<MessageSquare size={16} />} />
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4 pb-12">
          <div className="bg-card rounded-xl overflow-hidden">
            <ListItem
              theme={theme}
              label="Logout"
              icon={<LogOut size={16} className="text-destructive" />}
              onClick={() => setShowLogoutModal(true)}
              className="text-destructive font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProfileAppearance - 外观设置
 */
function ProfileAppearance() {
  const { theme, updateTheme } = useApp();

  return (
    <div className="pt-20 px-4 animate-slide-left">
      <div className="bg-card rounded-xl overflow-hidden">
        <ListItem
          theme={theme}
          label="Light"
          hasArrow={false}
          value={theme === 'light' ? <div className="w-4 h-4 rounded-full bg-blue-500" /> : null}
          onClick={() => updateTheme('light' as any)}
        />
        <ListItem
          theme={theme}
          label="Dark"
          hasArrow={false}
          value={theme === 'dark' ? <div className="w-4 h-4 rounded-full bg-blue-500" /> : null}
          onClick={() => updateTheme('dark' as any)}
        />
      </div>
    </div>
  );
}

/**
 * ProfileNotifications - 通知设置
 */
function ProfileNotifications() {
  const { theme } = useApp();
  const { setShowLogoutModal } = useViewState();

  // TODO: 从 context 获取通知设置

  return (
    <div className="min-h-screen relative animate-slide-left">
      <div className="pt-safe-top px-6 pb-6">
        <h1 className="text-3xl font-bold mt-4 text-foreground">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1 mb-8">Manage your meal reminders</p>

        <div className="bg-card rounded-2xl overflow-hidden mb-4">
          <ToggleItem
            theme={theme}
            label="Meal Reminders"
            subLabel="Receive notifications at scheduled times"
            checked={true}
            onToggle={() => {/* TODO */}}
          />
        </div>

        {/* Time Pickers */}
        {true && (
          <>
            <div className="bg-card rounded-2xl overflow-hidden mb-4">
              <div className="p-4">
                <div className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Breakfast Reminder
                </div>
                <TimePicker value="08:00" onChange={() => {/* TODO */}} language="en" theme={theme} />
              </div>
            </div>

            <div className="bg-card rounded-2xl overflow-hidden mb-4">
              <div className="p-4">
                <div className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Lunch Reminder
                </div>
                <TimePicker value="12:00" onChange={() => {/* TODO */}} language="en" theme={theme} />
              </div>
            </div>

            <div className="bg-card rounded-2xl overflow-hidden mb-8">
              <div className="p-4">
                <div className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Dinner Reminder
                </div>
                <TimePicker value="18:00" onChange={() => {/* TODO */}} language="en" theme={theme} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Back Button */}
      <div className="absolute bottom-12 left-6">
        <button
          onClick={() => {/* TODO: navigate back */}
          className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-card text-card-foreground' : 'bg-card text-foreground'} shadow-lg flex items-center justify-center`}
        >
          <ArrowLeft size={24} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ProfileRouter - 主路由器
// ============================================================

/**
 * ProfileRouter - Profile 视图路由器
 *
 * 处理所有 PROFILE_* 视图：
 * - PROFILE_HOME: Profile 主页
 * - PROFILE_EDIT: 编辑资料
 * - PROFILE_APPEARANCE: 外观设置
 * - PROFILE_LANGUAGE: 语言设置
 * - PROFILE_NOTIFICATIONS: 通知设置
 * - PROFILE_PRIVACY: 隐私设置
 * - PROFILE_SYNC: 数据同步
 */
export function ProfileRouter() {
  const { currentView, theme, setCurrentView } = useApp();

  // 添加日志来追踪当前视图
  React.useEffect(() => {
    console.log('[ProfileRouter] Current view:', currentView, 'is PROFILE_HOME:', currentView === AppView.PROFILE_HOME);
  }, [currentView]);

  // 判断是否是 Profile 主页（用于特殊导航栏样式）
  const isProfileHome = currentView === AppView.PROFILE_HOME;
  const navIconClass = isProfileHome
    ? "text-white drop-shadow-md"
    : (theme === 'dark' ? "text-white" : "text-black");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Bar */}
      {currentView !== AppView.PROFILE_NOTIFICATIONS && currentView !== AppView.PROFILE_PRIVACY && (
        <NavBar
          theme={theme}
          title={
            currentView === AppView.PROFILE_HOME ? '' :
              currentView === AppView.PROFILE_EDIT ? 'Edit Profile' :
                currentView === AppView.PROFILE_APPEARANCE ? 'Appearance' :
                  currentView === AppView.PROFILE_LANGUAGE ? 'Language' : ''
          }
          leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className={navIconClass} />}
          onLeftClick={() => setCurrentView(AppView.PROFILE_HOME)}
          className={currentView === AppView.PROFILE_HOME ? 'bg-transparent' : 'bg-card'}
        />
      )}

      {/* 视图路由 */}
      {currentView === AppView.PROFILE_HOME && <ProfileHome />}
      {currentView === AppView.PROFILE_EDIT && <ProfileEdit theme={theme} language="en" profileBgClass="bg-card" profileTextClass="text-foreground" onSave={() => setCurrentView(AppView.PROFILE_HOME)} />}
      {currentView === AppView.PROFILE_APPEARANCE && <ProfileAppearance />}
      {currentView === AppView.PROFILE_LANGUAGE && (
        <div className="pt-20 px-4 animate-slide-left">
          <div className="bg-card rounded-xl overflow-hidden">
            <ListItem theme={theme} label="简体中文" hasArrow={false} value={<div className="w-4 h-4 rounded-full bg-blue-500" />} onClick={() => {/* TODO */}} />
            <ListItem theme={theme} label="English" hasArrow={false} value={null} onClick={() => {/* TODO */}} />
          </div>
        </div>
      )}
      {currentView === AppView.PROFILE_NOTIFICATIONS && <ProfileNotifications />}
      {currentView === AppView.PROFILE_PRIVACY && (
        <div className="min-h-screen relative animate-slide-left">
          <div className="pt-safe-top px-6 pb-6">
            <h1 className="text-3xl font-bold mt-4 text-foreground">Privacy</h1>
            <p className="text-muted-foreground text-sm mt-1 mb-8">Control your privacy settings</p>
            <div className="bg-card rounded-2xl overflow-hidden mb-8">
              <ToggleItem theme={theme} label="Hide Ranking" subLabel="Don't appear in public rankings" checked={false} onToggle={() => {/* TODO */}} />
            </div>
          </div>
          <div className="absolute bottom-12 left-6">
            <button onClick={() => setCurrentView(AppView.PROFILE_HOME)} className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-[#2C2C2E] text-white' : 'bg-white text-black'} shadow-lg flex items-center justify-center`}>
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>
      )}
      {currentView === AppView.PROFILE_SYNC && (
        <div className="min-h-screen relative animate-slide-left">
          <NavBar theme={theme} title="Data Sync" leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className={navIconClass} />} onLeftClick={() => setCurrentView(AppView.PROFILE_HOME)} className="bg-card" />
          <div className="pt-safe-top px-4 pb-32 space-y-4">
            <SyncStatus userId="current-user" language="en" />
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {/* TODO: 提取为独立组件 */}
    </div>
  );
}
