import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, LockedOverlay } from '../../components/UIComponents';
import { MealList } from '../../components/MealList';
import { NutritionCard } from '../../components/NutritionCard';
import { Language, TEXT, Theme } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Apple, Beef, Wheat, Carrot, Sun, CloudSun, Moon, Coffee } from 'lucide-react';
import { useMeals } from '@/hooks/useMeals';
import { useToastNotification } from '@/contexts/ToastContext';
import { useMinDelay } from '@/hooks/useMinDelay';

interface Tab2HistoryProps {
  lang: Language;
  isPremium: boolean;
  onUpgrade: () => void;
  theme: Theme;
  refreshTrigger?: number;
}

// Meal time icon mapping
const MEAL_TIME_ICONS = {
  breakfast: <Sun size={20} />,
  lunch: <CloudSun size={20} />,
  dinner: <Moon size={20} />,
  snack: <Coffee size={20} />,
};

const MEAL_TIME_COLORS = {
  breakfast: 'bg-orange-100 text-orange-600',
  lunch: 'bg-yellow-100 text-yellow-600',
  dinner: 'bg-indigo-100 text-indigo-600',
  snack: 'bg-pink-100 text-pink-600',
};

const Tab2History: React.FC<Tab2HistoryProps> = ({ lang, isPremium, onUpgrade, theme, refreshTrigger }) => {
  const t = TEXT[lang];
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const textTitle = theme === 'dark' ? 'text-white/90' : 'text-black/90';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textTertiary = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
  const cardBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';
  const axisColor = theme === 'dark' ? '#555' : '#ddd';
  const tooltipBg = theme === 'dark' ? '#333' : '#fff';
  const tooltipColor = theme === 'dark' ? '#fff' : '#000';

  // Load meals from IndexedDB
  const { meals, isLoading: mealsLoading, deleteMeal, getMealsByDateRange, refresh } = useMeals();
  const { showSuccess, showError } = useToastNotification();
  const { showSkeleton } = useMinDelay(mealsLoading, 300);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refresh();
    }
  }, [refreshTrigger, refresh]);

  /**
   * Handle meal deletion with toast notification
   */
  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteMeal(mealId);
      showSuccess(
        lang === Language.ZH ? '删除成功' : 'Deleted',
        lang === Language.ZH ? '记录已删除' : 'Meal record deleted'
      );
    } catch (error) {
      showError(
        lang === Language.ZH ? '删除失败' : 'Delete Failed',
        lang === Language.ZH ? '请重试' : 'Please try again'
      );
    }
  };

  // Get today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split('T')[0];

  // Get today's meals grouped by meal time
  const todayMealsByTime = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      breakfast: meals.filter(m => {
        const mealDate = new Date(m.createdAt);
        return mealDate >= today && m.mealType === 'breakfast';
      }),
      lunch: meals.filter(m => {
        const mealDate = new Date(m.createdAt);
        return mealDate >= today && m.mealType === 'lunch';
      }),
      dinner: meals.filter(m => {
        const mealDate = new Date(m.createdAt);
        return mealDate >= today && m.mealType === 'dinner';
      }),
      snack: meals.filter(m => {
        const mealDate = new Date(m.createdAt);
        return mealDate >= today && m.mealType === 'snack';
      }),
    };
  }, [meals]);

  // Calculate today's total nutrition
  const todayNutrition = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMeals = meals.filter(m => {
      const mealDate = new Date(m.createdAt);
      return mealDate >= today;
    });

    return todayMeals.reduce((acc, meal) => {
      const nutrition = meal.analysis?.nutrition || { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };
      return {
        calories: acc.calories + (nutrition.calories || 0),
        protein: acc.protein + (nutrition.protein || 0),
        fat: acc.fat + (nutrition.fat || 0),
        carbohydrates: acc.carbohydrates + (nutrition.carbohydrates || 0),
      };
    }, { calories: 0, protein: 0, fat: 0, carbohydrates: 0 });
  }, [meals]);

  // Calculate calories by meal time
  const caloriesByMealTime = useMemo(() => {
    const sumForType = (mealType: string) => {
      return todayMealsByTime[mealType as keyof typeof todayMealsByTime].reduce((sum, meal) => {
        return sum + (meal.analysis?.nutrition?.calories || 0);
      }, 0);
    };

    return {
      breakfast: sumForType('breakfast'),
      lunch: sumForType('lunch'),
      dinner: sumForType('dinner'),
      snack: sumForType('snack'),
    };
  }, [todayMealsByTime]);

  // Generate weekly trend data from actual meals
  const weeklyTrendData = useMemo(() => {
    const days = lang === Language.ZH
      ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const now = new Date();
    const currentDay = now.getDay();

    // Calculate Monday of the current week
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const data = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      // Get meals for this day
      const dayMeals = meals.filter(m => {
        const mealDate = new Date(m.createdAt);
        return mealDate >= dayStart && mealDate <= dayEnd;
      });

      // Sum up calories
      const totalCal = dayMeals.reduce((sum, meal) => {
        return sum + (meal.analysis?.nutrition?.calories || 0);
      }, 0);

      // If no meals, show 0 instead of mock data
      data.push({
        day: days[dayStart.getDay()],
        date: dayStart.getDate(),
        cal: totalCal,
        isToday: dayStart.toDateString() === new Date().toDateString()
      });
    }

    return data;
  }, [meals, lang]);

  // Today's meals data for display
  const todayMealsData = useMemo(() => {
    return [
      {
        key: 'breakfast',
        label: lang === Language.ZH ? '早餐' : 'Breakfast',
        icon: MEAL_TIME_ICONS.breakfast,
        color: MEAL_TIME_COLORS.breakfast,
        cal: caloriesByMealTime.breakfast,
        count: todayMealsByTime.breakfast.length,
      },
      {
        key: 'lunch',
        label: lang === Language.ZH ? '午餐' : 'Lunch',
        icon: MEAL_TIME_ICONS.lunch,
        color: MEAL_TIME_COLORS.lunch,
        cal: caloriesByMealTime.lunch,
        count: todayMealsByTime.lunch.length,
      },
      {
        key: 'dinner',
        label: lang === Language.ZH ? '晚餐' : 'Dinner',
        icon: MEAL_TIME_ICONS.dinner,
        color: MEAL_TIME_COLORS.dinner,
        cal: caloriesByMealTime.dinner,
        count: todayMealsByTime.dinner.length,
      },
      {
        key: 'snack',
        label: lang === Language.ZH ? '加餐' : 'Snack',
        icon: MEAL_TIME_ICONS.snack,
        color: MEAL_TIME_COLORS.snack,
        cal: caloriesByMealTime.snack,
        count: todayMealsByTime.snack.length,
      },
    ];
  }, [caloriesByMealTime, todayMealsByTime, lang]);

  // Loading state
  if (showSkeleton) {
    return (
      <div className="pb-28 pt-24 px-4 animate-fade-in space-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 bg-muted rounded-2xl animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-28 pt-24 px-4 animate-fade-in space-y-6">
      {/* 1. Today's Nutrition Summary */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH ? '今日营养摄入' : "Today's Nutrition"}
        </h2>
        <NutritionCard
          calories={todayNutrition.calories}
          protein={todayNutrition.protein}
          fat={todayNutrition.fat}
          carbs={todayNutrition.carbohydrates}
          language={lang}
          theme={theme}
        />
      </div>

      {/* 2. Today's Meals by Time */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH ? '今日餐食' : "Today's Meals"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {todayMealsData.map(({ key, label, icon, color, cal, count }) => (
            <Card key={key} theme={theme} className={`${cardBg} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
                  {icon}
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${textTitle}`}>{cal}</div>
                  <div className={`text-xs ${textTertiary}`}>kcal</div>
                </div>
              </div>
              <div className={`text-sm ${textSecondary}`}>
                {label} ({count})
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Weekly Trend Chart */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH ? '本周趋势' : 'Weekly Trend'}
        </h2>
        <Card theme={theme} className={`${cardBg} p-4`}>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: axisColor, fontSize: 11 }}
                  interval={0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: axisColor, fontSize: 10 }}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    color: tooltipColor,
                    borderRadius: '8px',
                    border: 'none',
                  }}
                  formatter={(value: number) => [`${value} kcal`, '']}
                />
                <Line
                  type="monotone"
                  dataKey="cal"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <g>
                        {/* Highlight today */}
                        {payload.isToday && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={8}
                            fill="#10B981"
                            opacity={0.3}
                          />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={payload.isToday ? 5 : 4}
                          fill={payload.isToday ? '#10B981' : '#10B981'}
                          stroke={payload.isToday ? '#fff' : 'none'}
                          strokeWidth={payload.isToday ? 2 : 0}
                        />
                      </g>
                    );
                  }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 4. Recent Meals History */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH ? '最近记录' : 'Recent Meals'}
        </h2>
        <MealList
          meals={meals}
          language={lang}
          theme={theme}
          isLoading={mealsLoading}
          onMealClick={(meal) => console.log('Meal clicked:', meal.id)}
          onMealDelete={handleDeleteMeal}
        />
      </div>
    </div>
  );
};

export default Tab2History;
