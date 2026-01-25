import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useProfile, useMeals } from '@/hooks';
import { useAuth } from './AuthContext';
import { type Meal, type UserProfile, type UserSettings, type DailyNutrition } from '@/db';
import { Language, Theme, AppView } from '@/types';
import type { AuthSession } from '@/api/auth';
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('AppContext');

// ============================================================
// 类型定义
// ============================================================

// Action types
export type AppAction =
  | { type: 'ADD_MEAL'; payload: Meal }
  | { type: 'UPDATE_MEAL'; payload: Meal }
  | { type: 'DELETE_MEAL'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// State interface
interface AppState {
  // User data
  profile: UserProfile | null;
  settings: UserSettings | null;

  // Meals data
  meals: Meal[];
  mealsLoading: boolean;
  mealsError: string | null;

  // App state
  isLoading: boolean;
  error: string | null;
}

// Context interface - 扩展包含视图路由和 UI 状态
interface AppContextValue extends AppState {
  // ============================================================
  // 认证信息 (来自 AuthContext)
  // ============================================================
  userId: string;
  isAuthenticated: boolean;
  user: AuthSession | null;

  // ============================================================
  // 派生状态 - 语言和主题
  // ============================================================
  language: Language;
  theme: Theme;

  // ============================================================
  // 视图路由状态
  // ============================================================
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  navigateBack: () => void;

  // ============================================================
  // 刷新触发器
  // ============================================================
  refreshTrigger: number;
  incrementRefreshTrigger: () => void;

  // ============================================================
  // 操作 - 原有
  // ============================================================
  dispatch: React.Dispatch<AppAction>;
  addMeal: (meal: Meal) => Promise<void>;
  updateMeal: (meal: Meal) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  updateTheme: (theme: 'light' | 'dark') => Promise<void>;
  updateLanguage: (language: 'zh' | 'en') => Promise<void>;

  // ============================================================
  // 选择器
  // ============================================================
  getDailyStats: (date: string) => Promise<DailyNutrition | null>;
  getWeeklyStats: (startDate: string, endDate: string) => Promise<Meal[]>;

  // ============================================================
  // 刷新
  // ============================================================
  refresh: () => Promise<void>;
}

// Create context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider props
interface AppProviderProps {
  children: ReactNode;
  userId?: string;
}

const DEFAULT_USER_ID = 'current-user';

/**
 * AppContext Provider - 全局状态管理
 * 管理用户信息、设置、餐食数据、视图路由
 *
 * 职责：
 * - 整合 AuthContext, useProfile, useMeals
 * - 提供统一的视图路由管理
 * - 消除 props drilling
 */
export function AppProvider({ children, userId: propUserId }: AppProviderProps) {
  // ============================================================
  // 认证信息
  // ============================================================
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const userId = propUserId || user?.userId || DEFAULT_USER_ID;

  // ============================================================
  // 用户配置与餐食数据
  // ============================================================
  const { profile, settings, isLoading: profileLoading, updateTheme, updateLanguage } = useProfile(userId);
  const {
    meals,
    isLoading: mealsLoading,
    error: mealsError,
    saveMeal,
    updateMeal: updateMealHook,
    deleteMeal: deleteMealHook,
    getMealsByDateRange,
    refresh: refreshMeals,
  } = useMeals(userId);

  // ============================================================
  // UI 状态
  // ============================================================
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.MAIN_TABS);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ============================================================
  // 派生状态
  // ============================================================
  const language: Language = settings?.language === 'zh' ? Language.ZH : Language.EN;
  const theme: Theme = settings?.theme === 'dark' ? 'dark' : 'light';

  // ============================================================
  // 导航操作
  // ============================================================
  const navigateBack = useCallback(() => {
    setCurrentView(AppView.MAIN_TABS);
  }, []);

  const incrementRefreshTrigger = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // ============================================================
  // 副作用 - 主题应用到 document
  // ============================================================
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  /**
   * Dispatch function for state updates
   */
  const dispatch = useCallback(async (action: AppAction) => {
    switch (action.type) {
      case 'SET_LOADING':
        setIsLoading(action.payload);
        break;
      case 'SET_ERROR':
        setError(action.payload);
        break;
      default:
        logger.warn('Unknown action:', action);
    }
  }, []);

  /**
   * Add a new meal
   */
  const addMeal = useCallback(async (meal: Meal) => {
    try {
      await saveMeal(meal.imageUrl, meal.analysis, meal.mealType, meal.notes);
      logger.debug('Meal added:', meal.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add meal';
      setError(errorMessage);
      logger.error('Error adding meal:', err);
      throw err;
    }
  }, [saveMeal]);

  /**
   * Update an existing meal
   */
  const updateMeal = useCallback(async (meal: Meal) => {
    try {
      await updateMealHook(meal);
      logger.debug('Meal updated:', meal.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update meal';
      setError(errorMessage);
      logger.error('Error updating meal:', err);
      throw err;
    }
  }, [updateMealHook]);

  /**
   * Delete a meal
   */
  const deleteMeal = useCallback(async (mealId: string) => {
    try {
      await deleteMealHook(mealId);
      logger.debug('Meal deleted:', mealId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete meal';
      setError(errorMessage);
      logger.error('Error deleting meal:', err);
      throw err;
    }
  }, [deleteMealHook]);

  /**
   * Get daily statistics for a specific date
   * Calculates total calories, protein, fat, carbs for all meals on that date
   */
  const getDailyStats = useCallback(async (date: string): Promise<DailyNutrition | null> => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dayMeals = await getMealsByDateRange(
        startOfDay.toISOString(),
        endOfDay.toISOString()
      );

      if (dayMeals.length === 0) {
        return null;
      }

      // Aggregate nutrition data
      const totals = dayMeals.reduce(
        (acc, meal) => {
          const nutrition = meal.analysis?.nutrition || {
            calories: 0,
            protein: 0,
            fat: 0,
            carbohydrates: 0,
          };

          return {
            calories: acc.calories + (nutrition.calories || 0),
            protein: acc.protein + (nutrition.protein || 0),
            fat: acc.fat + (nutrition.fat || 0),
            carbohydrates: acc.carbohydrates + (nutrition.carbohydrates || 0),
          };
        },
        { calories: 0, protein: 0, fat: 0, carbohydrates: 0 }
      );

      return {
        userId,
        date,
        ...totals,
        mealCount: dayMeals.length,
        createdAt: date,
        updatedAt: new Date().toISOString(),
      };
    } catch (err) {
      logger.error('Error getting daily stats:', err);
      return null;
    }
  }, [userId, getMealsByDateRange]);

  /**
   * Get weekly statistics for a date range
   * Returns all meals within the range for aggregation
   */
  const getWeeklyStats = useCallback(async (
    startDate: string,
    endDate: string
  ): Promise<Meal[]> => {
    try {
      return getMealsByDateRange(startDate, endDate);
    } catch (err) {
      logger.error('Error getting weekly stats:', err);
      return [];
    }
  }, [getMealsByDateRange]);

  /**
   * Refresh all data from IndexedDB
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await refreshMeals();
      logger.debug('Data refreshed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      logger.error('Error refreshing:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshMeals]);

  // Context value
  const value: AppContextValue = {
    // ============================================================
    // 认证信息
    // ============================================================
    userId,
    isAuthenticated,
    user,

    // ============================================================
    // 派生状态
    // ============================================================
    language,
    theme,

    // ============================================================
    // UI 状态
    // ============================================================
    currentView,
    setCurrentView,
    navigateBack,
    refreshTrigger,
    incrementRefreshTrigger,

    // ============================================================
    // 原有状态
    // ============================================================
    profile,
    settings,
    meals,
    mealsLoading,
    mealsError,
    isLoading: isLoading || profileLoading || authLoading,
    error,

    // Actions
    dispatch,
    addMeal,
    updateMeal,
    deleteMeal,
    updateTheme,
    updateLanguage,

    // Selectors
    getDailyStats,
    getWeeklyStats,

    // Refresh
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * useApp hook - Access the AppContext
 * @throws Error if used outside of AppProvider
 */
export function useApp(): AppContextValue {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
}

/**
 * Convenience hook to get just the meals state
 */
export function useAppMeals() {
  const { meals, mealsLoading, mealsError, addMeal, updateMeal, deleteMeal, refresh } = useApp();
  return { meals, mealsLoading, mealsError, addMeal, updateMeal, deleteMeal, refresh };
}

/**
 * Convenience hook to get just the profile state
 */
export function useAppProfile() {
  const { profile, settings, isLoading, updateTheme, updateLanguage } = useApp();
  return { profile, settings, isLoading, updateTheme, updateLanguage };
}

/**
 * Convenience hook to get just the selectors
 */
export function useAppSelectors() {
  const { getDailyStats, getWeeklyStats } = useApp();
  return { getDailyStats, getWeeklyStats };
}
