import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Drumstick, Wheat, Droplet, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { SkeletonStats } from './ui/skeleton';
import { useMinDelay } from '@/hooks/useMinDelay';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { type Meal } from '@/db';
import { Language, Theme } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface NutritionCardProps {
  meals?: Meal[];
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  language: Language;
  theme: Theme;
  isLoading?: boolean;
}

interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

const DEFAULT_GOALS: NutritionGoals = {
  calories: 2000,
  protein: 50,
  fat: 65,
  carbs: 250,
};

/**
 * Calculate daily nutrition totals from meals
 */
function calculateDailyNutrition(meals: Meal[]): DailyNutrition {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayMeals = meals.filter((meal) => {
    const mealDate = new Date(meal.createdAt);
    mealDate.setHours(0, 0, 0, 0);
    return mealDate.getTime() === today.getTime();
  });

  return todayMeals.reduce(
    (acc, meal) => {
      const nutrition = meal.analysis?.nutrition || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0,
      };

      return {
        date: today.toISOString().split('T')[0],
        calories: acc.calories + (nutrition.calories || 0),
        protein: acc.protein + (nutrition.protein || 0),
        fat: acc.fat + (nutrition.fat || 0),
        carbs: acc.carbs + (nutrition.carbohydrates || 0),
      };
    },
    { date: '', calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

/**
 * Calculate weekly nutrition data for chart
 */
function calculateWeeklyTrends(meals: Meal[]): Array<{ day: string; cal: number }> {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = [];
  const now = new Date();
  const currentDay = now.getDay();

  // Calculate Monday of the current week
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    dayDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(dayDate);
    nextDay.setDate(dayDate.getDate() + 1);

    // Sum calories for this day
    const dayCalories = meals
      .filter((meal) => {
        const mealDate = new Date(meal.createdAt);
        return mealDate >= dayDate && mealDate < nextDay;
      })
      .reduce((sum, meal) => {
        return sum + (meal.analysis?.nutrition?.calories || 0);
      }, 0);

    data.push({
      day: days[dayDate.getDay()],
      cal: dayCalories,
    });
  }

  return data;
}

/**
 * Animated number component - 确保显示格式化的数字
 */
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  // 确保值是有效数字，避免 NaN 或 Infinity
  const safeValue = Number.isFinite(value) ? value : 0;

  // 使用 toFixed 处理小数位数，然后转换为 Number 去除尾随零
  const formatted = decimals === 0
    ? Math.round(safeValue).toString()
    : safeValue.toFixed(decimals);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {formatted}
    </motion.span>
  );
}

/**
 * Progress bar component
 */
function ProgressBar({
  value,
  max,
  color,
  theme,
}: {
  value: number;
  max: number;
  color: string;
  theme: Theme;
}) {
  const styles = useThemeStyles(theme);
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`h-full ${color} rounded-full`}
        style={{ minWidth: percentage > 0 ? '4px' : '0' }}
      />
    </div>
  );
}

/**
 * NutritionCard Component - Displays daily nutrition summary with goals
 * Supports two modes:
 * 1. Pass meals array to auto-calculate nutrition
 * 2. Pass direct values (calories, protein, fat, carbs) for manual display
 */
export function NutritionCard({
  meals,
  calories: propsCalories,
  protein: propsProtein,
  fat: propsFat,
  carbs: propsCarbs,
  language,
  theme,
  isLoading = false
}: NutritionCardProps) {
  const styles = useThemeStyles(theme);

  // Calculate from meals if provided, otherwise use direct props
  const dailyNutrition = useMemo(() => {
    if (meals && meals.length >= 0) {
      return calculateDailyNutrition(meals);
    }
    // Use direct props if provided
    return {
      date: new Date().toISOString().split('T')[0],
      calories: propsCalories ?? 0,
      protein: propsProtein ?? 0,
      fat: propsFat ?? 0,
      carbs: propsCarbs ?? 0,
    };
  }, [meals, propsCalories, propsProtein, propsFat, propsCarbs]);

  const weeklyTrends = useMemo(() => {
    if (meals && meals.length >= 0) {
      return calculateWeeklyTrends(meals);
    }
    return [];
  }, [meals]);

  const { showSkeleton } = useMinDelay(isLoading, 300);

  const hasData = meals ? meals.length > 0 : (propsCalories ?? 0) > 0;
  const goals = DEFAULT_GOALS;

  // Colors for progress bars
  const colors = {
    calories: 'bg-gradient-to-r from-orange-400 to-red-500',
    protein: 'bg-gradient-to-r from-red-400 to-pink-500',
    fat: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    carbs: 'bg-gradient-to-r from-green-400 to-emerald-500',
  };

  // Tooltip styles
  const tooltipBg = theme === 'dark' ? '#333' : '#fff';
  const tooltipColor = theme === 'dark' ? '#fff' : '#000';
  const axisColor = theme === 'dark' ? '#555' : '#ddd';

  // Show skeleton if loading or within minimum delay (prevents flash)
  if (showSkeleton) {
    return (
      <Card className={`p-5 ${styles.bgCard}`}>
        <SkeletonStats />
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className={`p-6 ${styles.bgCard}`}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className={`w-16 h-16 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
            <TrendingUp className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-lg font-semibold ${styles.textTitle} mb-2`}>
            {language === Language.ZH ? '暂无数据' : 'No Data Yet'}
          </h3>
          <p className={`text-sm ${styles.textSecondary}`}>
            {language === Language.ZH
              ? '记录第一餐后即可查看营养统计'
              : 'Start tracking meals to see nutrition stats'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Daily Summary */}
      <Card className={`p-5 ${styles.bgCard}`}>
        <h3 className={`text-lg font-bold mb-4 ${styles.textTitle}`}>
          {language === Language.ZH ? '今日营养摄入' : 'Today\'s Nutrition'}
        </h3>

        {/* Calories */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Flame size={18} className="text-orange-500" />
              <span className={`text-sm font-medium ${styles.textSecondary}`}>
                {language === Language.ZH ? '热量' : 'Calories'}
              </span>
            </div>
            <span className={`text-sm ${styles.textSecondary}`}>
              <AnimatedNumber value={dailyNutrition.calories} decimals={0} /> / {goals.calories} kcal
            </span>
          </div>
          <ProgressBar value={dailyNutrition.calories} max={goals.calories} color={colors.calories} theme={theme} />
        </div>

        {/* Protein */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Drumstick size={18} className="text-red-500" />
              <span className={`text-sm font-medium ${styles.textSecondary}`}>
                {language === Language.ZH ? '蛋白质' : 'Protein'}
              </span>
            </div>
            <span className={`text-sm ${styles.textSecondary}`}>
              <AnimatedNumber value={dailyNutrition.protein} decimals={1} /> / {goals.protein} g
            </span>
          </div>
          <ProgressBar value={dailyNutrition.protein} max={goals.protein} color={colors.protein} theme={theme} />
        </div>

        {/* Fat */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Droplet size={18} className="text-yellow-500" />
              <span className={`text-sm font-medium ${styles.textSecondary}`}>
                {language === Language.ZH ? '脂肪' : 'Fat'}
              </span>
            </div>
            <span className={`text-sm ${styles.textSecondary}`}>
              <AnimatedNumber value={dailyNutrition.fat} decimals={1} /> / {goals.fat} g
            </span>
          </div>
          <ProgressBar value={dailyNutrition.fat} max={goals.fat} color={colors.fat} theme={theme} />
        </div>

        {/* Carbs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Wheat size={18} className="text-green-500" />
              <span className={`text-sm font-medium ${styles.textSecondary}`}>
                {language === Language.ZH ? '碳水' : 'Carbs'}
              </span>
            </div>
            <span className={`text-sm ${styles.textSecondary}`}>
              <AnimatedNumber value={dailyNutrition.carbs} decimals={1} /> / {goals.carbs} g
            </span>
          </div>
          <ProgressBar value={dailyNutrition.carbs} max={goals.carbs} color={colors.carbs} theme={theme} />
        </div>
      </Card>

      {/* Weekly Trends - only show if we have meals data */}
      {meals && weeklyTrends.length > 0 && (
        <Card className={`p-5 ${styles.bgCard}`}>
          <h3 className={`text-lg font-bold mb-4 ${styles.textTitle}`}>
            {language === Language.ZH ? '本周趋势' : 'Weekly Trends'}
          </h3>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  stroke={axisColor}
                  tick={{ fill: tooltipColor, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={axisColor}
                  tick={{ fill: tooltipColor, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: 'none',
                    borderRadius: '8px',
                    color: tooltipColor,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cal"
                  stroke={theme === 'dark' ? '#E5E7EB' : '#333'}
                  strokeWidth={2}
                  dot={{ fill: theme === 'dark' ? '#E5E7EB' : '#333', r: 4 }}
                  activeDot={{ r: 6, fill: '#E85D75' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
