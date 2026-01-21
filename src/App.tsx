import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppView, Language, AnalysisResult, TEXT, Theme } from './types';
import { TabBar, NavBar, ListItem, ToggleItem } from './components/UIComponents';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { OfflineBanner } from './components/OfflineBanner';
import { PullToRefresh, useRefreshTimestamp } from './components/PullToRefresh';
import { SyncStatus } from './components/SyncStatus';
import { ConflictBanner } from './components/ConflictBanner';
import { ConflictResolutionModal } from './components/ConflictResolutionModal';
import { ProfileEdit } from './components/ProfileEdit';
import { TimePicker } from './components/TimePicker';
import { cn } from './lib/utils';
import { fadeInUp, pageTransition } from './lib/motion';
import { useOnline } from './hooks/useOnline';
import { useProfile } from './hooks/useProfile';
import { useBackendUpload } from './hooks/useBackendUpload';
import { DAILY_ANALYSIS_LIMIT } from './config';
import { useTabSwipeNavigation, springConfig, tabVariants, getSlideDirection } from './hooks/useSwipeNavigation';
import { useTabBarHide } from './hooks/useScrollHide';
import { ChevronLeft, Check, Copy, Share2, MessageSquare, Star, Settings, X, ChevronRight, Clock, ArrowLeft, Zap, BookOpen, FileText, BarChart3, Edit3, Loader2, Cloud, LogOut } from 'lucide-react';
import { LimitReachedOverlay } from './components/LimitReachedOverlay';
import { CircularProgress } from './components/CircularProgress';
import { getMealsByDateRange } from './hooks/useMeals';
import { useAuth } from './contexts/AuthContext';
import { LoginView, RegisterView } from './views/AuthViews';
import { useUserUnlockedDishes } from './hooks/useUserUnlockedDishes';
import * as api from './api';

// Lazy load tabs for code splitting
const Tab1Home = React.lazy(() => import('./views/tabs/Tab1Home'));
const Tab2History = React.lazy(() => import('./views/tabs/Tab2History'));
const TabPassport = React.lazy(() => import('./views/tabs/TabPassport'));
const Tab4Social = React.lazy(() => import('./views/tabs/Tab4Social'));

// Lazy load social sub-views
const LeaderboardPage = React.lazy(() => import('./views/SocialSubViews').then(m => ({ default: m.LeaderboardPage })));
const UserDetailPage = React.lazy(() => import('./views/SocialSubViews').then(m => ({ default: m.UserDetailPage })));

// Import Passport Sub-views
import { CuisineDetail } from './views/subviews/CuisineDetail';
import { DishDetail } from './views/subviews/DishDetail';
import { useMeals } from './hooks/useMeals';

export default function App() {
  // Network status
  const isOnline = useOnline();

  // Authentication
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();

  // Get authenticated user ID, or fallback to 'current-user' for offline mode
  const userId = user?.userId || 'current-user';

  // User profile and settings (persisted to IndexedDB)
  const { profile, settings, isLoading: profileLoading, updateTheme, updateLanguage, saveProfile } = useProfile(userId);

  // Backend upload workflow - uses backend API for upload + AI analysis + Supabase storage
  const { state: uploadState, uploadWithAnalysis, reset: resetUpload } = useBackendUpload();

  // Add a refresh trigger for meals
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State
  const [currentView, setCurrentView] = useState<AppView>(AppView.MAIN_TABS);
  const [activeTab, setActiveTab] = useState(0);
  const [previousTab, setPreviousTab] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showLimitOverlay, setShowLimitOverlay] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  console.log('App Render:', { currentView, selectedCuisine, selectedDish, userId, isAuthenticated, user });

  // Global meals data for sub-views - pass userId to get correct user's meals
  const { meals, refresh: refreshMeals } = useMeals(userId);

  // User stats (cuisines, dishes)
  const { data: statsData, refresh: refreshStats } = useUserUnlockedDishes(userId);

  // Derived stats from backend
  const statsCuisineCount = statsData ? new Set(statsData.dishes.map(d => d.cuisine)).size : 0;
  const statsDishCount = statsData?.totalDishes || 0;

  // Refresh meals when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('[App] Refreshing meals and stats due to refreshTrigger:', refreshTrigger);
      refreshMeals();
      refreshStats();
    }
  }, [refreshTrigger, refreshMeals, refreshStats]);

  // Analysis progress animation
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start progress animation when uploading begins
    if (currentView === AppView.ANALYSIS_RESULT && uploadState.isUploading) {
      // Reset progress to 0 when starting
      setAnalysisProgress(0);

      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      // Increment progress every 150ms
      progressIntervalRef.current = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 98) {
            return 98; // Cap at 98% until analysis completes
          }
          return prev + 1; // Increment by 1% every 150ms for smooth progress
        });
      }, 150);
    }

    // Clear interval and set to 100% when analysis completes
    if (currentView === AppView.ANALYSIS_RESULT && !uploadState.isUploading && uploadState.analysis) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setAnalysisProgress(100);
    }

    // Cleanup on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentView, uploadState.isUploading, uploadState.analysis]);

  // Swipe navigation for tabs
  const { swipeHandlers, canSwipeLeft, canSwipeRight } = useTabSwipeNavigation({
    activeTab,
    tabCount: 4,
    onTabChange: (newTab) => {
      setPreviousTab(activeTab);
      setActiveTab(newTab);
    },
    threshold: 50,
  });

  // Scroll to hide tab bar
  const { isHidden: isTabBarHidden } = useTabBarHide({ threshold: 30, hideDelay: 150 });

  // Refresh timestamp tracking
  const { refresh, getTimeAgo } = useRefreshTimestamp();

  // Refresh handler - reload data from IndexedDB
  const handleRefresh = useCallback(async () => {
    // Trigger a reload of meals data
    // The useMeals hook will automatically reload when its key changes
    // For now, we just track the timestamp
    // In a real app, you might want to fetch from server here
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate refresh
  }, []);

  // Use settings values with defaults for initial render
  const language = settings?.language === 'zh' ? Language.ZH : Language.EN;
  const theme: Theme = settings?.theme === 'dark' ? 'dark' : 'light';

  // Handlers for theme/language changes
  const handleThemeChange = async (newTheme: Theme) => {
    // Cast to any to avoid type mismatch between types.ts Theme (system) and useProfile Theme (auto)
    await updateTheme(newTheme as any);
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    await updateLanguage(newLanguage === Language.ZH ? 'zh' : 'en');
  };

  // Settings State
  const [notifications, setNotifications] = useState({
    reminders: true,
    breakfastReminderTime: '08:00',
    lunchReminderTime: '12:00',
    dinnerReminderTime: '18:00',
  });

  // Initialize notifications from backend settings
  useEffect(() => {
    if (settings) {
      setNotifications({
        reminders: settings.notificationsEnabled ?? true,
        breakfastReminderTime: settings.breakfastReminderTime ?? '08:00',
        lunchReminderTime: settings.lunchReminderTime ?? '12:00',
        dinnerReminderTime: settings.dinnerReminderTime ?? '18:00',
      });
    }
  }, [settings]);

  const [privacy, setPrivacy] = useState({
    hideRanking: false,
  });

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TEXT[language];

  // --- Handlers ---

  const handleCameraClick = () => {
    // Disable camera when offline
    if (!isOnline) {
      alert('离线模式下无法使用拍照分析功能，请检查网络连接');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check Daily Limit for Free Users (only if not already checked by backend)
    if (!isPremium) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

      try {
        const todayMeals = await getMealsByDateRange(userId, startOfDay, endOfDay);
        if (todayMeals.length >= DAILY_ANALYSIS_LIMIT) {
          setShowLimitOverlay(true);
          navigateToPremium();
          // Clear the file input so the same file can be selected again later if needed
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
      } catch (err) {
        console.error('Failed to check meal limit:', err);
        // In case of error, maybe allow it or show error? For now, allow to proceed to not block user on error.
      }
    }

    // Navigate to analysis view first
    setCurrentView(AppView.ANALYSIS_RESULT);

    // Upload and analyze using backend API
    try {
      await uploadWithAnalysis(file);
      // Trigger refresh for other pages since backend auto-saves the meal
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('[App] Backend upload failed:', error);
    }

    // Clear the file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const navigateToProfile = () => setCurrentView(AppView.PROFILE_HOME);
  const navigateBack = () => setCurrentView(AppView.MAIN_TABS);
  const navigateToPremium = () => setCurrentView(AppView.PREMIUM_LANDING);
  const navigateToPayment = () => setCurrentView(AppView.PAYMENT_GATEWAY);

  const handleSubscribe = () => {
    // Simulate Apple Pay
    navigateToPayment();
    setTimeout(() => {
      setIsPremium(true);
      setCurrentView(AppView.MAIN_TABS); // Or back to premium success
    }, 2000);
  };

  const toggleNotification = async () => {
    const newValue = !notifications.reminders;
    // Update local state first for immediate feedback
    setNotifications(prev => ({ ...prev, reminders: newValue }));

    // Sync to backend
    try {
      await api.profile.updateSettings({
        notificationsEnabled: newValue,
        breakfastReminderTime: notifications.breakfastReminderTime,
        lunchReminderTime: notifications.lunchReminderTime,
        dinnerReminderTime: notifications.dinnerReminderTime,
      });
      console.log('[App] Notification settings updated:', {
        notificationsEnabled: newValue,
        breakfastReminderTime: notifications.breakfastReminderTime,
        lunchReminderTime: notifications.lunchReminderTime,
        dinnerReminderTime: notifications.dinnerReminderTime,
      });
    } catch (error) {
      console.error('[App] Failed to update notification settings:', error);
      // Revert on error
      setNotifications(prev => ({ ...prev, reminders: !newValue }));
    }
  };

  const handleBreakfastReminderTimeChange = async (newTime: string) => {
    // Update local state first for immediate feedback
    setNotifications(prev => ({ ...prev, breakfastReminderTime: newTime }));

    // Sync to backend
    try {
      await api.profile.updateSettings({
        notificationsEnabled: notifications.reminders,
        breakfastReminderTime: newTime,
        lunchReminderTime: notifications.lunchReminderTime,
        dinnerReminderTime: notifications.dinnerReminderTime,
      });
      console.log('[App] Breakfast reminder time updated:', { breakfastReminderTime: newTime });
    } catch (error) {
      console.error('[App] Failed to update breakfast reminder time:', error);
      // Revert on error
      setNotifications(prev => ({ ...prev, breakfastReminderTime: notifications.breakfastReminderTime }));
    }
  };

  const handleLunchReminderTimeChange = async (newTime: string) => {
    // Update local state first for immediate feedback
    setNotifications(prev => ({ ...prev, lunchReminderTime: newTime }));

    // Sync to backend
    try {
      await api.profile.updateSettings({
        notificationsEnabled: notifications.reminders,
        breakfastReminderTime: notifications.breakfastReminderTime,
        lunchReminderTime: newTime,
        dinnerReminderTime: notifications.dinnerReminderTime,
      });
      console.log('[App] Lunch reminder time updated:', { lunchReminderTime: newTime });
    } catch (error) {
      console.error('[App] Failed to update lunch reminder time:', error);
      // Revert on error
      setNotifications(prev => ({ ...prev, lunchReminderTime: notifications.lunchReminderTime }));
    }
  };

  const handleDinnerReminderTimeChange = async (newTime: string) => {
    // Update local state first for immediate feedback
    setNotifications(prev => ({ ...prev, dinnerReminderTime: newTime }));

    // Sync to backend
    try {
      await api.profile.updateSettings({
        notificationsEnabled: notifications.reminders,
        breakfastReminderTime: notifications.breakfastReminderTime,
        lunchReminderTime: notifications.lunchReminderTime,
        dinnerReminderTime: newTime,
      });
      console.log('[App] Dinner reminder time updated:', { dinnerReminderTime: newTime });
    } catch (error) {
      console.error('[App] Failed to update dinner reminder time:', error);
      // Revert on error
      setNotifications(prev => ({ ...prev, dinnerReminderTime: notifications.dinnerReminderTime }));
    }
  };

  const togglePrivacy = async () => {
    const newValue = !privacy.hideRanking;
    // Update local state first for immediate feedback
    setPrivacy(prev => ({ ...prev, hideRanking: newValue }));

    // Sync to backend
    try {
      await api.profile.updateSettings({
        hideRanking: newValue,
      });
      console.log('[App] Privacy settings updated:', { hideRanking: newValue });
    } catch (error) {
      console.error('[App] Failed to update privacy settings:', error);
      // Revert on error
      setPrivacy(prev => ({ ...prev, hideRanking: !newValue }));
    }
  };

  // Apply dark mode class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Styles based on Theme - using CSS variables
  const mainBgClass = 'bg-background text-foreground';
  const profileBgClass = 'bg-card';
  const profileTextClass = 'text-foreground';

  // --- Render Views ---

  // 1. Analysis View
  if (currentView === AppView.ANALYSIS_RESULT) {
    // Simulated progress for upload state
    const simulatedProgress = analysisProgress;

    return (
      <div className={`min-h-screen ${mainBgClass} p-4 safe-top animate-fade-in relative`}>
        <button onClick={navigateBack} className="absolute top-safe-top left-4 z-50 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white">
          <ChevronLeft size={24} />
        </button>

        {/* Error State */}
        {uploadState.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-safe-top bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl"
          >
            <p className="text-sm font-medium">{uploadState.error}</p>
            {uploadState.quotaExceeded && uploadState.quotaInfo && (
              <p className="text-xs mt-2">
                {language === Language.ZH ? '每日限额' : 'Daily limit'}: {uploadState.quotaInfo.limit}
                | {language === Language.ZH ? '剩余' : 'Remaining'}: {uploadState.quotaInfo.remaining}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                resetUpload();
                navigateBack();
              }}
            >
              {language === Language.ZH ? '返回' : 'Back'}
            </Button>
          </motion.div>
        )}

        {/* Top: Two Cards Side by Side */}
        <div className="grid grid-cols-2 gap-3 mt-safe-top mb-4">
          {/* Left Card: Uploaded Image */}
          <Card className="overflow-hidden">
            <div className="aspect-square w-full relative">
              {uploadState.imageUrl ? (
                <img
                  src={uploadState.imageUrl}
                  className="w-full h-full object-cover"
                  alt="Uploaded dish"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </Card>

          {/* Right Card: Progress Circle */}
          <Card className="flex flex-col items-center justify-center p-4">
            <CircularProgress progress={simulatedProgress} size={100} />
            <p className="text-sm font-medium mt-3 text-center">
              {uploadState.isUploading
                ? (language === Language.ZH ? '智能分析中' : 'Analyzing...')
                : (language === Language.ZH ? '分析完成' : 'Analysis Complete')}
            </p>
          </Card>
        </div>

        {/* Bottom: Three Cards */}
        {!uploadState.isUploading && uploadState.analysis ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-3 pb-10"
          >
            {/* Card 1: Suggestions */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {language === Language.ZH ? '生成建议' : 'Suggestions'}
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {uploadState.analysis.dishSuggestion || (uploadState.analysis.suggestions?.map((s, i) => s).join(' ') || '-')}
              </p>
            </Card>

            {/* Card 2: Nutrition Analysis */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                {language === Language.ZH ? '营养构成' : 'Nutrition Facts'}
              </h3>
              <div>
                {uploadState.analysis && (
                  <>
                    {/* Get dishes array or fallback to single dish */}
                    {(() => {
                      const dishes = uploadState.analysis.dishes || (
                        uploadState.analysis.foodName ? [{
                          foodName: uploadState.analysis.foodName,
                          cuisine: uploadState.analysis.cuisine,
                          nutrition: uploadState.analysis.nutrition,
                        }] : []
                      );

                      // Calculate total calories
                      const totalCalories = dishes.reduce((sum, dish) =>
                        sum + (dish.nutrition?.calories || 0), 0
                      );

                      return (
                        <>
                          {/* Display each dish */}
                          {dishes.map((dish, index) => (
                            <div key={index} className={index > 0 ? 'mt-3' : ''}>
                              {/* Row 1: Dish Name */}
                              <div className="py-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-base font-medium">
                                    {dish.foodName || (language === Language.ZH ? '未知食物' : 'Unknown Food')}
                                  </span>
                                  {dish.cuisine && (
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                      {dish.cuisine}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Row 2: Nutrition Data */}
                              {dish.nutrition && (
                                <div className={cn(
                                  "py-3 pb-4 flex items-center justify-between text-sm",
                                  index === dishes.length - 1 ? "" : "border-b border-border"
                                )}>
                                  {/* Calories */}
                                  <span className="font-medium text-orange-500">
                                    {Math.round(dish.nutrition.calories || 0)} kcal
                                  </span>
                                  {/* Protein */}
                                  <span className="font-medium text-red-500">
                                    P: {Math.round(dish.nutrition.protein || 0)}g
                                  </span>
                                  {/* Fat */}
                                  <span className="font-medium text-yellow-500">
                                    F: {Math.round(dish.nutrition.fat || 0)}g
                                  </span>
                                  {/* Carbs */}
                                  <span className="font-medium text-green-500">
                                    C: {Math.round(dish.nutrition.carbohydrates || 0)}g
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Total Calories Summary */}
                          {dishes.length > 0 && dishes.some(d => d.nutrition) && (
                            <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-border">
                              <span className="text-sm font-semibold text-foreground">
                                {language === Language.ZH ? '总热量' : 'Total Calories'}
                              </span>
                              <span className="text-lg font-bold text-orange-500">
                                {Math.round(totalCalories)} kcal
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </Card>

            {/* Card 3: Image Recognition / Description */}
            <Card className="p-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {language === Language.ZH ? '识别图像' : 'Image Recognition'}
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                {uploadState.analysis.description || (language === Language.ZH ? '暂无描述' : 'No description available')}
              </p>
            </Card>

            {/* Success Message - Backend auto-saves */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-green-600 dark:text-green-400 mt-4"
            >
              {language === Language.ZH ? '记录已自动保存到云端' : 'Record automatically saved to cloud'}
              {uploadState.quotaInfo && (
                <span className="block text-xs mt-1 text-muted-foreground">
                  ({language === Language.ZH ? '今日剩余' : 'Today remaining'}: {uploadState.quotaInfo.remaining}/{uploadState.quotaInfo.limit})
                </span>
              )}
            </motion.div>

            {/* Back to Home Button */}
            <Button
              onClick={navigateBack}
              className="w-full py-6 text-lg font-semibold mt-4"
              size="lg"
            >
              {language === Language.ZH ? '保存记录' : 'Save Record'}
            </Button>
          </motion.div>
        ) : !uploadState.isUploading && !uploadState.error && (
          <div className="text-center mt-10 text-muted-foreground">
            {language === Language.ZH ? '分析失败，请重试' : 'Analysis Failed. Please try again.'}
          </div>
        )}
      </div>
    );
  }

  // 1b. Social Sub-Views
  if (currentView === AppView.SOCIAL_EXPERTS_LIST) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <LeaderboardPage
          title={t.cuisine_experts}
          type="experts"
          lang={language}
          theme={theme}
          onBack={navigateBack}
          onUserClick={(user) => {
            setSelectedUser(user);
            setCurrentView(AppView.SOCIAL_USER_DETAIL);
          }}
          userId={userId}
        />
      </Suspense>
    );
  }

  if (currentView === AppView.SOCIAL_RANKING_LIST) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <LeaderboardPage
          title={t.gourmet_ranking}
          type="ranking"
          lang={language}
          theme={theme}
          onBack={navigateBack}
          onUserClick={(user) => {
            setSelectedUser(user);
            setCurrentView(AppView.SOCIAL_USER_DETAIL);
          }}
          userId={userId}
        />
      </Suspense>
    );
  }

  if (currentView === AppView.SOCIAL_USER_DETAIL) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <UserDetailPage
          user={selectedUser}
          lang={language}
          theme={theme}
          onBack={() => {
            setCurrentView(AppView.MAIN_TABS);
          }}
        />
      </Suspense>
    );
  }

  // 1c. Passport Sub-Views
  if (currentView === AppView.PASSPORT_CUISINE_DETAIL && selectedCuisine) {
    return (
      <CuisineDetail
        cuisine={selectedCuisine}
        lang={language}
        theme={theme}
        onBack={() => {
          setCurrentView(AppView.MAIN_TABS);
          setSelectedCuisine(null);
        }}
        onDishClick={(dishName) => {
          setSelectedDish(dishName);
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
          setSelectedDish(null);
        }}
      />
    );
  }

  // 2. Profile Views
  if (currentView.startsWith('PROFILE')) {
    const isProfileHome = currentView === AppView.PROFILE_HOME;
    // Use white with shadow for Profile Home (on image), high contrast for others
    const navIconClass = isProfileHome
      ? "text-white drop-shadow-md"
      : (theme === 'dark' ? "text-white" : "text-black");

    return (
      <div className={`min-h-screen bg-background ${profileTextClass}`}>

        {/* Standard Nav Bar for non-special pages */}
        {currentView !== AppView.PROFILE_NOTIFICATIONS && currentView !== AppView.PROFILE_PRIVACY && (
          <NavBar
            theme={theme}
            title={
              currentView === AppView.PROFILE_HOME ? '' :
                currentView === AppView.PROFILE_EDIT ? t.edit_profile :
                  currentView === AppView.PROFILE_APPEARANCE ? t.appearance :
                    currentView === AppView.PROFILE_LANGUAGE ? t.language : ''
            }
            leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className={navIconClass} />}
            onLeftClick={currentView === AppView.PROFILE_HOME ? navigateBack : navigateToProfile}
            className={currentView === AppView.PROFILE_HOME ? 'bg-transparent' : 'bg-card'}
          />
        )}

        {/* Profile Home (13,14) */}
        {currentView === AppView.PROFILE_HOME && (
          <div className="animate-fade-in">
            {/* Header Image */}
            <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: 'url(https://picsum.photos/800/600?food)' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"></div>
              <div className="absolute bottom-4 left-4 flex items-end">
                <div className="w-20 h-20 rounded-full border-2 border-white bg-gray-200 overflow-hidden mr-4">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'default'}`} alt="Avatar" />
                </div>
                <div className="mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {profile?.displayName || user?.displayName || (isAuthenticated ? 'User' : (language === Language.ZH ? '访客' : 'Guest'))}
                  </h1>
                  <p className="text-sm text-white/70">
                    {user ? `@${user.username}` : (language === Language.ZH ? '未登录' : 'Not logged in')}
                  </p>
                  {profile?.bio && (
                    <p className="text-sm text-white/80 mt-1 max-w-xs">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-6">
              <div className="flex justify-between items-center px-2">
                <div className="text-sm text-muted-foreground">
                  {statsDishCount} {t.dishes_count} • {statsCuisineCount} {t.cuisine_count} {t.unlocked}
                </div>
                <Button variant="outline" className="h-8 px-4 text-xs py-0" onClick={navigateToPremium}>{t.unlock_btn}</Button>
              </div>

              {/* Authentication Section */}
              <div className="space-y-1">
                <h3 className="text-xs text-muted-foreground ml-4 mb-2">{t.account_title}</h3>
                <div className={`${profileBgClass} rounded-xl overflow-hidden`}>
                  {isAuthenticated ? (
                    <>
                      <ListItem
                        theme={theme}
                        label={t.edit_profile}
                        onClick={() => setCurrentView(AppView.PROFILE_EDIT)}
                      />
                    </>
                  ) : (
                    <>
                      <ListItem
                        theme={theme}
                        label={language === Language.ZH ? '登录' : 'Login'}
                        onClick={() => setCurrentView(AppView.AUTH_LOGIN)}
                      />
                      <ListItem
                        theme={theme}
                        label={language === Language.ZH ? '注册账户' : 'Register'}
                        onClick={() => setCurrentView(AppView.AUTH_REGISTER)}
                      />
                    </>
                  )}
                  <ListItem theme={theme} label={t.subscribe_monthly} onClick={navigateToPremium} />
                </div>
              </div>

              {/* Menu Group 2 */}
              <div className="space-y-1">
                <h3 className="text-xs text-muted-foreground ml-4 mb-2">{t.settings_title}</h3>
                <div className={`${profileBgClass} rounded-xl overflow-hidden`}>
                  <ListItem theme={theme} label={t.appearance} onClick={() => setCurrentView(AppView.PROFILE_APPEARANCE)} />
                  <ListItem theme={theme} label={t.language} value={language === Language.EN ? 'English' : '简体中文'} onClick={() => setCurrentView(AppView.PROFILE_LANGUAGE)} />
                  <ListItem theme={theme} label={t.notifications} onClick={() => setCurrentView(AppView.PROFILE_NOTIFICATIONS)} />
                  <ListItem theme={theme} label={t.privacy} onClick={() => setCurrentView(AppView.PROFILE_PRIVACY)} />
                  <ListItem theme={theme} label={language === Language.ZH ? '数据同步' : 'Data Sync'} icon={<Cloud size={16} />} onClick={() => setCurrentView(AppView.PROFILE_SYNC)} />
                </div>
              </div>

              {/* Menu Group 3 - Social/Info */}
              <div className="space-y-1">
                <h3 className="text-xs text-muted-foreground ml-4 mb-2">Info</h3>
                <div className={`${profileBgClass} rounded-xl overflow-hidden`}>
                  <ListItem theme={theme} label="About 2.0" icon={<div className="w-5 h-5 rounded-full border border-gray-500 flex items-center justify-center text-[10px]">i</div>} />
                  <ListItem theme={theme} label="Share with Friends" icon={<Share2 size={16} />} />
                  <ListItem theme={theme} label="Rate App" icon={<Star size={16} />} />
                  <ListItem theme={theme} label="Feedback" icon={<MessageSquare size={16} />} />
                </div>
              </div>

              {/* Logout Button at the bottom */}
              {isAuthenticated && (
                <div className="pt-4 pb-12">
                  <div className={`${profileBgClass} rounded-xl overflow-hidden border border-destructive/20`}>
                    <ListItem
                      theme={theme}
                      label={language === Language.ZH ? '退出登录' : 'Logout'}
                      icon={<LogOut size={16} className="text-destructive" />}
                      onClick={() => setShowLogoutModal(true)}
                      className="text-destructive font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Edit (15) */}
        {currentView === AppView.PROFILE_EDIT && (
          <ProfileEdit
            language={language}
            theme={theme}
            profileBgClass={profileBgClass}
            profileTextClass={profileTextClass}
            onSave={navigateToProfile}
          />
        )}

        {/* Appearance (16) */}
        {currentView === AppView.PROFILE_APPEARANCE && (
          <div className="pt-20 px-4 animate-slide-left">
            <div className={`${profileBgClass} rounded-xl overflow-hidden`}>
              <ListItem theme={theme} label="Light" hasArrow={false} value={theme === 'light' ? <Check size={16} className="text-blue-500" /> : null} onClick={() => handleThemeChange('light')} />
              <ListItem theme={theme} label="Dark" hasArrow={false} value={theme === 'dark' ? <Check size={16} className="text-blue-500" /> : null} onClick={() => handleThemeChange('dark')} />
            </div>
          </div>
        )}

        {/* Language */}
        {currentView === AppView.PROFILE_LANGUAGE && (
          <div className="pt-20 px-4 animate-slide-left">
            <div className={`${profileBgClass} rounded-xl overflow-hidden`}>
              <ListItem theme={theme}
                label="简体中文"
                hasArrow={false}
                value={language === Language.ZH ? <Check size={20} className="text-blue-500" /> : null}
                onClick={() => handleLanguageChange(Language.ZH)}
              />
              <ListItem theme={theme}
                label="English"
                hasArrow={false}
                value={language === Language.EN ? <Check size={20} className="text-blue-500" /> : null}
                onClick={() => handleLanguageChange(Language.EN)}
              />
            </div>
          </div>
        )}

        {/* Notifications (Updated 17.jpg style) */}
        {currentView === AppView.PROFILE_NOTIFICATIONS && (
          <div className="min-h-screen relative animate-slide-left">
            <div className="pt-safe-top px-6 pb-6">
              <h1 className={`text-3xl font-bold mt-4 ${profileTextClass}`}>{t.notify_header}</h1>
              <p className="text-muted-foreground text-sm mt-1 mb-8">{t.notify_sub}</p>

              <div className={`${profileBgClass} rounded-2xl overflow-hidden mb-4`}>
                <ToggleItem
                  theme={theme}
                  label={t.notify_toggle_title}
                  subLabel={t.notify_toggle_desc}
                  checked={notifications.reminders}
                  onToggle={toggleNotification}
                />
              </div>

              {/* Meal Reminder Time Pickers */}
              {notifications.reminders && (
                <>
                  {/* Breakfast Time Picker */}
                  <div className={`${profileBgClass} rounded-2xl overflow-hidden mb-4`}>
                    <div className="p-4">
                      <div className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {language === Language.ZH ? '早餐提醒' : 'Breakfast Reminder'}
                      </div>
                      <TimePicker
                        value={notifications.breakfastReminderTime}
                        onChange={handleBreakfastReminderTimeChange}
                        language={language}
                        theme={theme}
                      />
                    </div>
                  </div>

                  {/* Lunch Time Picker */}
                  <div className={`${profileBgClass} rounded-2xl overflow-hidden mb-4`}>
                    <div className="p-4">
                      <div className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {language === Language.ZH ? '午餐提醒' : 'Lunch Reminder'}
                      </div>
                      <TimePicker
                        value={notifications.lunchReminderTime}
                        onChange={handleLunchReminderTimeChange}
                        language={language}
                        theme={theme}
                      />
                    </div>
                  </div>

                  {/* Dinner Time Picker */}
                  <div className={`${profileBgClass} rounded-2xl overflow-hidden mb-8`}>
                    <div className="p-4">
                      <div className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {language === Language.ZH ? '晚餐提醒' : 'Dinner Reminder'}
                      </div>
                      <TimePicker
                        value={notifications.dinnerReminderTime}
                        onChange={handleDinnerReminderTimeChange}
                        language={language}
                        theme={theme}
                      />
                    </div>
                  </div>

                  <p className={`text-xs text-muted-foreground mb-8 text-center`}>
                    {language === Language.ZH
                      ? '在设定时间发送饮食记录提醒'
                      : 'Receive meal reminders at scheduled times'}
                  </p>
                </>
              )}

              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t.notify_footer_title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.notify_footer_desc}
              </p>
            </div>
            {/* Floating Bottom Left Back Button */}
            <div className="absolute bottom-12 left-6">
              <button
                onClick={navigateToProfile}
                className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-[#2C2C2E] text-white' : 'bg-white text-black'} shadow-lg flex items-center justify-center`}
              >
                <ArrowLeft size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Privacy (Updated 18.jpg style) */}
        {currentView === AppView.PROFILE_PRIVACY && (
          <div className="min-h-screen relative animate-slide-left">
            <div className="pt-safe-top px-6 pb-6">
              <h1 className={`text-3xl font-bold mt-4 ${profileTextClass}`}>{t.privacy_header}</h1>
              <p className="text-muted-foreground text-sm mt-1 mb-8">{t.privacy_sub}</p>

              <div className={`${profileBgClass} rounded-2xl overflow-hidden mb-8`}>
                <ToggleItem
                  theme={theme}
                  label={t.privacy_toggle_title}
                  subLabel={t.privacy_toggle_desc}
                  checked={privacy.hideRanking}
                  onToggle={togglePrivacy}
                />
              </div>
            </div>
            {/* Floating Bottom Left Back Button */}
            <div className="absolute bottom-12 left-6">
              <button
                onClick={navigateToProfile}
                className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-[#2C2C2E] text-white' : 'bg-white text-black'} shadow-lg flex items-center justify-center`}
              >
                <ArrowLeft size={24} />
              </button>
            </div>
          </div>
        )}

        {/* Sync Settings */}
        {currentView === AppView.PROFILE_SYNC && (
          <div className="min-h-screen relative animate-slide-left">
            <NavBar
              theme={theme}
              title={language === Language.ZH ? '数据同步' : 'Data Sync'}
              leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className={navIconClass} />}
              onLeftClick={navigateToProfile}
              className="bg-card"
            />
            <div className="pt-safe-top px-4 pb-32 space-y-4">
              <SyncStatus userId={userId} language={language === Language.ZH ? Language.ZH : Language.EN} />
            </div>
          </div>
        )}

        {/* Logout Confirmation Modal - Enhanced with Neumorphic Design */}
        <AnimatePresence>
          {showLogoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop with fade */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
                style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                onClick={() => setShowLogoutModal(false)}
              />

              {/* Modal with Spring Animation */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative z-10 w-full max-w-sm rounded-3xl p-6"
                style={{
                  background: theme === 'dark' ? '#2C2C2E' : '#ffffff',
                  boxShadow: theme === 'dark'
                    ? '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.1)'
                    : '0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(0,0,0,0.05)',
                }}
              >
                {/* Icon with Gradient Background */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
                  className="flex justify-center mb-5"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 50%, rgba(220, 38, 38, 0.05) 100%)',
                      boxShadow: theme === 'dark'
                        ? 'inset 0 2px 8px rgba(249, 115, 22, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                        : 'inset 0 2px 8px rgba(249, 115, 22, 0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
                    }}
                  >
                    <LogOut size={28} style={{ color: '#f97316' }} />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
                  className="text-2xl font-bold text-center mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {language === Language.ZH ? '退出登录' : 'Logout'}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
                  className="text-center text-base mb-8"
                  style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                >
                  {language === Language.ZH ? '确定要退出登录吗？' : 'Are you sure you want to logout?'}
                </motion.p>

                {/* Buttons with Neumorphic Style */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.25 }}
                  className="flex gap-3"
                >
                  {/* Cancel Button */}
                  <motion.button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-3.5 rounded-2xl font-medium transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: theme === 'dark' ? '#3C3C3E' : '#f3f4f6',
                      color: theme === 'dark' ? '#ffffff' : '#1f2937',
                      boxShadow: theme === 'dark'
                        ? 'inset 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                        : 'inset 0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
                    }}
                  >
                    {language === Language.ZH ? '取消' : 'Cancel'}
                  </motion.button>

                  {/* Logout Button */}
                  <motion.button
                    onClick={async () => {
                      setShowLogoutModal(false);
                      await logout();
                      navigateBack();
                    }}
                    className="flex-1 py-3.5 rounded-2xl font-medium text-white transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
                      boxShadow: '0 6px 20px rgba(249, 115, 22, 0.35), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
                    }}
                  >
                    {language === Language.ZH ? '退出' : 'Logout'}
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  // 3. Premium View
  if (currentView === AppView.PREMIUM_LANDING) {
    return (
      <div className="min-h-screen bg-background p-4 pt-safe-top relative overflow-hidden flex flex-col">
        {showLimitOverlay && (
          <LimitReachedOverlay
            lang={language}
            onDismiss={() => setShowLimitOverlay(false)}
          />
        )}
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={navigateBack} className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}>
            <ArrowLeft size={24} className={theme === 'dark' ? 'text-white' : 'text-black'} />
          </button>
          <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>

        <div className="text-center mb-8 px-4">
          <h1 className={`text-xl font-serif font-medium mb-3 ${theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]'}`}>{t.premium_title}</h1>
          <p className={`${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'} text-xs tracking-wide`}>{t.premium_subtitle}</p>
        </div>

        {/* 2x2 Grid Features */}
        <div className="grid grid-cols-2 gap-3 mb-8 px-2">
          {/* Card 1 */}
          <div className="bg-gradient-to-br from-[#E85D75]/30 to-[#C0392B]/20 p-4 rounded-xl border border-[#E85D75]/30 flex flex-col h-32 relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-50"><Edit3 size={32} color="#E85D75" /></div>
            <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-[#FF9A9E]' : 'text-[#D14D68]'}`}>{t.feat_1_title}</div>
            <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_1_desc}</p>
          </div>
          {/* Card 2 */}
          <div className="bg-gradient-to-br from-[#D2E603]/30 to-[#76B900]/20 p-4 rounded-xl border border-[#D2E603]/30 flex flex-col h-32 relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-50"><Zap size={32} color="#D2E603" /></div>
            <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-[#E6FF50]' : 'text-[#8EA800]'}`}>{t.feat_2_title}</div>
            <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_2_desc}</p>
          </div>
          {/* Card 3 */}
          <div className="bg-gradient-to-br from-[#F3E5AB]/30 to-[#D4AF37]/20 p-4 rounded-xl border border-[#F3E5AB]/30 flex flex-col h-32 relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-50"><BookOpen size={32} color="#F3E5AB" /></div>
            <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-[#F3E5AB]' : 'text-[#B8860B]'}`}>{t.feat_3_title}</div>
            <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_3_desc}</p>
          </div>
          {/* Card 4 */}
          <div className="bg-gradient-to-br from-gray-500/30 to-gray-700/20 p-4 rounded-xl border border-gray-500/30 flex flex-col h-32 relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-50"><BarChart3 size={32} color="gray" /></div>
            <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-700'}`}>{t.feat_4_title}</div>
            <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_4_desc}</p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-2 gap-4 px-2 mb-6">
          {/* Monthly */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`rounded-2xl p-4 border transition-all cursor-pointer ${selectedPlan === 'monthly'
              ? `border-[#E0CEB5] ${theme === 'dark' ? 'bg-[#E0CEB5]/10' : 'bg-[#E0CEB5]/20'}`
              : `${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} bg-transparent`
              }`}
          >
            <div className={`text-sm mb-2 ${selectedPlan === 'monthly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-foreground')}`}>{t.subscribe_monthly}</div>
            <div className={`text-2xl font-serif mb-2 ${selectedPlan === 'monthly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-black')}`}>{t.plan_monthly_price}</div>
            <p className={`text-[10px] whitespace-pre-wrap ${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{t.plan_monthly_desc}</p>
          </div>
          {/* Yearly */}
          <div
            onClick={() => setSelectedPlan('yearly')}
            className={`rounded-2xl p-4 border transition-all cursor-pointer ${selectedPlan === 'yearly'
              ? `border-[#E0CEB5] ${theme === 'dark' ? 'bg-[#E0CEB5]/10' : 'bg-[#E0CEB5]/20'}`
              : `${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} bg-transparent`
              }`}
          >
            <div className={`text-sm mb-2 ${selectedPlan === 'yearly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-foreground')}`}>{t.subscribe_yearly}</div>
            <div className={`text-2xl font-serif mb-2 ${selectedPlan === 'yearly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-black')}`}>{t.plan_yearly_price}</div>
            <p className={`text-[10px] whitespace-pre-wrap ${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{t.plan_yearly_desc}</p>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-auto px-4 pb-8">
          <Button variant="gold" fullWidth onClick={navigateToPayment} className="h-12 bg-gradient-to-r from-[#E0CEB5] to-[#D4AF37] text-black font-bold tracking-wide shadow-lg shadow-yellow-900/20">
            {t.subscribe_btn}
          </Button>
          <div className={`flex justify-center mt-4 space-x-8 text-xs ${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            <span className="cursor-pointer">{t.restore}</span>
            <span className="cursor-pointer">{t.redeem}</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Auth Views
  if (currentView === AppView.AUTH_LOGIN) {
    return (
      <LoginView
        language={language}
        theme={theme}
        onBack={navigateBack}
        onRegisterClick={() => setCurrentView(AppView.AUTH_REGISTER)}
        onLoginSuccess={navigateBack}
      />
    );
  }

  if (currentView === AppView.AUTH_REGISTER) {
    return (
      <RegisterView
        language={language}
        theme={theme}
        onBack={navigateBack}
        onLoginClick={() => setCurrentView(AppView.AUTH_LOGIN)}
        onRegisterSuccess={navigateBack}
      />
    );
  }

  // 5. Main Tabs
  // Show loading state while initializing
  if (authLoading || profileLoading) {
    return (
      <div className={`min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6`}>
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Show login prompt if user is not authenticated and has no offline data
  if (!isAuthenticated && meals.length === 0) {
    return (
      <div className={`min-h-screen ${mainBgClass} flex flex-col items-center justify-center p-6`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <span className="text-5xl">🍽️</span>
          </div>
          <h1 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {language === Language.ZH ? '欢迎使用胃之书' : 'Welcome to Bellybook'}
          </h1>
          <p className={`text-sm mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === Language.ZH
              ? '登录以保存您的美食记录，开启美食探索之旅'
              : 'Login to save your food records and start your culinary journey'}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setCurrentView(AppView.AUTH_LOGIN)}
              className="w-full"
              size="lg"
            >
              {language === Language.ZH ? '登录' : 'Login'}
            </Button>
            <Button
              onClick={() => setCurrentView(AppView.AUTH_REGISTER)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {language === Language.ZH ? '注册账户' : 'Register'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative ${mainBgClass}`}>
      {/* Offline Status Banner */}
      <OfflineBanner isOffline={!isOnline} />

      {/* Conflict Banner */}
      <ConflictBanner language={language} theme={theme} onResolveClick={() => setShowConflictModal(true)} />

      {/* Top Bar for Main Tabs */}
      <div className="fixed top-0 left-0 right-0 h-[50px] z-40 flex items-center justify-between px-4 mt-safe-top bg-gradient-to-b from-background/80 to-transparent">
        {/* Top Left: User Avatar (Profile) - Replaces Tomato for Passport feel */}
        <div onClick={navigateToProfile} className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer shadow-lg overflow-hidden border border-white/20 relative">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
        </div>

        {/* Title changes based on tab */}
        <h1 className="text-lg font-bold tracking-wide">
          {activeTab === 0 ? t.tab_home :
            activeTab === 1 ? t.tab_passport :
              activeTab === 2 ? t.tab_data :
                t.tab_social}
        </h1>

        {/* Top Right: Premium Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={navigateToPremium}
          className="flex items-center px-3 py-1.5 rounded-full border border-border bg-muted text-primary transition-all"
        >
          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center mr-2">
            <Check size={10} className="text-primary-foreground font-bold" />
          </div>
          <span className="text-xs font-semibold">{t.premium}</span>
        </motion.button>
      </div>

      {/* Tab Content with Swipe Navigation and PullToRefresh */}
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
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            }>
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
                      console.log('App: Navigating to CuisineDetail', cuisine);
                      setSelectedCuisine(cuisine);
                      setCurrentView(AppView.PASSPORT_CUISINE_DETAIL);
                    }}
                  />
                </PullToRefresh>
              )}
              {activeTab === 2 && (
                <PullToRefresh onRefresh={handleRefresh} language={language}>
                  <Tab2History lang={language} isPremium={isPremium} onUpgrade={navigateToPremium} theme={theme} refreshTrigger={refreshTrigger} userId={userId} />
                </PullToRefresh>
              )}
              {activeTab === 3 && (
                <PullToRefresh onRefresh={handleRefresh} language={language}>
                  <Tab4Social lang={language} theme={theme} onExpertsClick={() => setCurrentView(AppView.SOCIAL_EXPERTS_LIST)} onRankingClick={() => setCurrentView(AppView.SOCIAL_RANKING_LIST)} userId={userId} />
                </PullToRefresh>
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hidden File Input for Camera */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <motion.div
        initial={false}
        animate={{ y: isTabBarHidden ? 100 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <TabBar
          activeTab={activeTab}
          onTabChange={(newTab) => {
            setPreviousTab(activeTab);
            setActiveTab(newTab);
          }}
          onCameraClick={handleCameraClick}
          lang={language}
          theme={theme}
        />
      </motion.div>

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        language={language}
        theme={theme}
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
      />
    </div>
  );
}