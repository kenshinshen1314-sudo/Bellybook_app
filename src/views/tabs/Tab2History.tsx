import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UIComponents';
import { MealList } from '../../components/MealList';
import { Language, TEXT, Theme } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Sun, CloudSun, Moon, Coffee, ChevronLeft, ChevronRight, Calendar, Flame } from 'lucide-react';
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

// Ball interface for physics simulation
interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  label: string;
  value: number;
  unit: string;
  labelColor: string;
}

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

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Energy balls state
  const containerRef = useRef<HTMLDivElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const animationRef = useRef<number>();

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

  // Get meals for selected date
  const selectedDateMeals = useMemo(() => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    return meals.filter(m => {
      const mealDate = new Date(m.createdAt);
      return mealDate >= startOfDay && mealDate <= endOfDay;
    });
  }, [meals, selectedDate]);

  // Get selected date's meals grouped by meal time
  const selectedDateMealsByTime = useMemo(() => {
    return {
      breakfast: selectedDateMeals.filter(m => m.mealType === 'breakfast'),
      lunch: selectedDateMeals.filter(m => m.mealType === 'lunch'),
      dinner: selectedDateMeals.filter(m => m.mealType === 'dinner'),
      snack: selectedDateMeals.filter(m => m.mealType === 'snack'),
    };
  }, [selectedDateMeals]);

  // Calculate selected date's total nutrition
  const selectedDateNutrition = useMemo(() => {
    return selectedDateMeals.reduce((acc, meal) => {
      const nutrition = meal.analysis?.nutrition || { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };
      return {
        calories: acc.calories + (nutrition.calories || 0),
        protein: acc.protein + (nutrition.protein || 0),
        fat: acc.fat + (nutrition.fat || 0),
        carbohydrates: acc.carbohydrates + (nutrition.carbohydrates || 0),
      };
    }, { calories: 0, protein: 0, fat: 0, carbohydrates: 0 });
  }, [selectedDateMeals]);

  // Calculate calories by meal time
  const caloriesByMealTime = useMemo(() => {
    const sumForType = (mealType: string) => {
      return selectedDateMealsByTime[mealType as keyof typeof selectedDateMealsByTime].reduce((sum, meal) => {
        return sum + (meal.analysis?.nutrition?.calories || 0);
      }, 0);
    };

    return {
      breakfast: sumForType('breakfast'),
      lunch: sumForType('lunch'),
      dinner: sumForType('dinner'),
      snack: sumForType('snack'),
    };
  }, [selectedDateMealsByTime]);

  // Generate weekly trend data from actual meals
  const weeklyTrendData = useMemo(() => {
    const days = lang === Language.ZH
      ? ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const selectedDay = new Date(selectedDate);
    const currentDay = selectedDay.getDay();

    // Calculate Monday of the selected date's week
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(selectedDay);
    monday.setDate(selectedDay.getDate() - distanceToMonday);
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

      data.push({
        day: days[dayStart.getDay()],
        date: dayStart.getDate(),
        cal: totalCal,
        isToday: dayStart.toDateString() === new Date().toDateString(),
        isSelected: dayStart.toDateString() === selectedDate.toDateString(),
      });
    }

    return data;
  }, [meals, lang, selectedDate]);

  // Selected date's meals data for display
  const selectedDateMealsData = useMemo(() => {
    return [
      {
        key: 'breakfast',
        label: lang === Language.ZH ? '早餐' : 'Breakfast',
        icon: MEAL_TIME_ICONS.breakfast,
        color: MEAL_TIME_COLORS.breakfast,
        cal: caloriesByMealTime.breakfast,
        count: selectedDateMealsByTime.breakfast.length,
      },
      {
        key: 'lunch',
        label: lang === Language.ZH ? '午餐' : 'Lunch',
        icon: MEAL_TIME_ICONS.lunch,
        color: MEAL_TIME_COLORS.lunch,
        cal: caloriesByMealTime.lunch,
        count: selectedDateMealsByTime.lunch.length,
      },
      {
        key: 'dinner',
        label: lang === Language.ZH ? '晚餐' : 'Dinner',
        icon: MEAL_TIME_ICONS.dinner,
        color: MEAL_TIME_COLORS.dinner,
        cal: caloriesByMealTime.dinner,
        count: selectedDateMealsByTime.dinner.length,
      },
      {
        key: 'snack',
        label: lang === Language.ZH ? '加餐' : 'Snack',
        icon: MEAL_TIME_ICONS.snack,
        color: MEAL_TIME_COLORS.snack,
        cal: caloriesByMealTime.snack,
        count: selectedDateMealsByTime.snack.length,
      },
    ];
  }, [caloriesByMealTime, selectedDateMealsByTime, lang]);

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return lang === Language.ZH ? '今天' : 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return lang === Language.ZH ? '昨天' : 'Yesterday';
    } else {
      return lang === Language.ZH
        ? `${date.getMonth() + 1}月${date.getDate()}日`
        : `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  };

  // Navigate date
  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    // Empty cells for days before first of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const hasMeals = meals.some(m => {
        const mealDate = new Date(m.createdAt);
        return mealDate.toDateString() === date.toDateString();
      });

      days.push(
        <button
          key={day}
          onClick={() => {
            setSelectedDate(date);
            setShowCalendar(false);
          }}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all ${
            isSelected
              ? 'bg-orange-500 text-white font-bold'
              : isToday
                ? 'bg-orange-100 text-orange-600 font-bold'
                : hasMeals
                  ? theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'
                  : 'text-gray-400'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Initialize energy balls
  useEffect(() => {
    const containerWidth = 320;
    const containerHeight = 200;

    const nutrition = selectedDateNutrition;
    const maxVal = Math.max(nutrition.calories, nutrition.protein, nutrition.fat, nutrition.carbohydrates, 1);

    const newBalls: Ball[] = [
      {
        id: 'calories',
        x: containerWidth / 2,
        y: 40,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 28 + (nutrition.calories / maxVal) * 10,
        color: '#FF6B6B',
        label: lang === Language.ZH ? '总热量' : 'Calories',
        value: Math.round(nutrition.calories),
        unit: 'kcal',
        labelColor: '#FF6B6B',
      },
      {
        id: 'protein',
        x: 60,
        y: 80,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 22 + (nutrition.protein / maxVal) * 8,
        color: '#EF4444',
        label: lang === Language.ZH ? '蛋白质' : 'Protein',
        value: Math.round(nutrition.protein),
        unit: 'g',
        labelColor: '#EF4444',
      },
      {
        id: 'fat',
        x: containerWidth - 60,
        y: 70,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 20 + (nutrition.fat / maxVal) * 8,
        color: '#F59E0B',
        label: lang === Language.ZH ? '脂肪' : 'Fat',
        value: Math.round(nutrition.fat),
        unit: 'g',
        labelColor: '#F59E0B',
      },
      {
        id: 'carbs',
        x: containerWidth / 2,
        y: 150,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 24 + (nutrition.carbohydrates / maxVal) * 8,
        color: '#10B981',
        label: lang === Language.ZH ? '碳水' : 'Carbs',
        value: Math.round(nutrition.carbohydrates),
        unit: 'g',
        labelColor: '#10B981',
      },
    ];

    setBalls(newBalls);
  }, [selectedDateNutrition, lang]);

  // Physics simulation loop
  useEffect(() => {
    if (balls.length === 0) return;

    const containerWidth = 320;
    const containerHeight = 200;

    const animate = () => {
      setBalls(prevBalls => {
        const newBalls = prevBalls.map(ball => ({
          ...ball,
          x: ball.x + ball.vx,
          y: ball.y + ball.vy,
        }));

        // Boundary collision
        newBalls.forEach(ball => {
          // Left/right boundaries
          if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx) * 0.9;
          } else if (ball.x + ball.radius > containerWidth) {
            ball.x = containerWidth - ball.radius;
            ball.vx = -Math.abs(ball.vx) * 0.9;
          }

          // Top/bottom boundaries
          if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy) * 0.9;
          } else if (ball.y + ball.radius > containerHeight) {
            ball.y = containerHeight - ball.radius;
            ball.vy = -Math.abs(ball.vy) * 0.9;
          }
        });

        // Ball-to-ball collision
        for (let i = 0; i < newBalls.length; i++) {
          for (let j = i + 1; j < newBalls.length; j++) {
            const ball1 = newBalls[i];
            const ball2 = newBalls[j];

            const dx = ball2.x - ball1.x;
            const dy = ball2.y - ball1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = ball1.radius + ball2.radius;

            if (distance < minDistance) {
              // Collision detected - exchange velocities
              const angle = Math.atan2(dy, dx);
              const sin = Math.sin(angle);
              const cos = Math.cos(angle);

              // Rotate velocities
              const vx1 = ball1.vx * cos + ball1.vy * sin;
              const vy1 = ball1.vy * -sin + ball1.vy * cos;
              const vx2 = ball2.vx * cos + ball2.vy * sin;
              const vy2 = ball2.vy * -sin + ball2.vy * cos;

              // Elastic collision
              const m1 = ball1.radius * ball1.radius;
              const m2 = ball2.radius * ball2.radius;
              const newVx1 = ((m1 - m2) * vx1 + 2 * m2 * vx2) / (m1 + m2);
              const newVx2 = ((m2 - m1) * vx2 + 2 * m1 * vx1) / (m1 + m2);

              // Rotate back
              ball1.vx = newVx1 * cos - vy1 * sin;
              ball1.vy = vy1 * cos + newVx1 * sin;
              ball2.vx = newVx2 * cos - vy2 * sin;
              ball2.vy = vy2 * cos + newVx2 * sin;

              // Separate balls to prevent sticking
              const overlap = minDistance - distance;
              const separationX = (overlap / 2) * cos;
              const separationY = (overlap / 2) * sin;
              ball1.x -= separationX;
              ball1.y -= separationY;
              ball2.x += separationX;
              ball2.y += separationY;

              // Add minimum velocity to keep balls moving
              const minSpeed = 0.5;
              if (Math.abs(ball1.vx) < minSpeed && Math.abs(ball1.vy) < minSpeed) {
                ball1.vx += (Math.random() - 0.5) * minSpeed;
                ball1.vy += (Math.random() - 0.5) * minSpeed;
              }
              if (Math.abs(ball2.vx) < minSpeed && Math.abs(ball2.vy) < minSpeed) {
                ball2.vx += (Math.random() - 0.5) * minSpeed;
                ball2.vy += (Math.random() - 0.5) * minSpeed;
              }
            }
          }
        }

        return newBalls;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [balls.length]);

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
      {/* Date Selector with Calendar */}
      <div className="relative">
        <Card theme={theme} className={`${cardBg} p-4`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate(-1)}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors`}
            >
              <ChevronLeft size={20} className={textColor} />
            </button>

            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'} transition-colors`}
            >
              <Calendar size={18} className={textSecondary} />
              <span className={`font-semibold ${textTitle}`}>
                {formatDateDisplay(selectedDate)}
              </span>
            </button>

            <button
              onClick={() => navigateDate(1)}
              disabled={selectedDate.toDateString() === new Date().toDateString()}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors disabled:opacity-30`}
            >
              <ChevronRight size={20} className={textColor} />
            </button>
          </div>

          {/* Calendar Popup */}
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl shadow-xl z-10 ${theme === 'dark' ? 'bg-[#2C2C2E]' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className={`text-center font-semibold mb-3 ${textTitle}`}>
                  {lang === Language.ZH
                    ? `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月`
                    : selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {lang === Language.ZH
                    ? ['日', '一', '二', '三', '四', '五', '六'].map(d => (
                        <div key={d} className={`text-xs ${textTertiary} py-1`}>{d}</div>
                      ))
                    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className={`text-xs ${textTertiary} py-1`}>{d}</div>
                      ))}
                  {generateCalendarDays()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Energy Balls - Physics Simulation */}
      <Card theme={theme} className={`${cardBg} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-lg font-semibold ${textTitle}`}>
            {lang === Language.ZH ? '营养构成' : 'Nutrition Breakdown'}
          </h2>
          <div className={`flex items-center gap-1 ${textSecondary}`}>
            <Flame size={16} className="text-orange-500" />
            <span className={`text-sm font-medium`}>{Math.round(selectedDateNutrition.calories)} kcal</span>
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto overflow-hidden rounded-2xl"
          style={{ width: 320, height: 200 }}
        >
          {balls.map(ball => (
            <motion.div
              key={ball.id}
              className="absolute flex flex-col items-center justify-center text-center cursor-pointer"
              style={{
                left: ball.x - ball.radius,
                top: ball.y - ball.radius,
                width: ball.radius * 2,
                height: ball.radius * 2,
              }}
              whileHover={{ scale: 1.1 }}
            >
              <div
                className="rounded-full shadow-lg flex flex-col items-center justify-center"
                style={{
                  width: ball.radius * 2,
                  height: ball.radius * 2,
                  background: `radial-gradient(circle at 30% 30%, ${ball.color}DD, ${ball.color})`,
                  boxShadow: `0 4px 12px ${ball.color}66, inset 0 -2px 8px ${ball.color}33`,
                }}
              >
                <div className="text-white font-bold" style={{ fontSize: Math.max(10, ball.radius * 0.4) }}>
                  {ball.value}
                </div>
                <div className="text-white text-xs" style={{ fontSize: Math.max(8, ball.radius * 0.25) }}>
                  {ball.unit}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Fixed Legend at Bottom */}
        <div className="flex justify-center gap-4 mt-3">
          {balls.map(ball => (
            <div key={ball.id} className="flex items-center gap-1.5">
              <div
                className="rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: ball.color,
                }}
              />
              <span className={`text-xs font-medium`} style={{ color: ball.labelColor }}>
                {ball.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Selected Date's Meals by Time */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {formatDateDisplay(selectedDate)} - {lang === Language.ZH ? '餐食' : 'Meals'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {selectedDateMealsData.map(({ key, label, icon, color, cal, count }) => (
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

      {/* Weekly Trend Chart */}
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
                        {payload.isSelected && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={10}
                            fill="#F59E0B"
                            opacity={0.3}
                          />
                        )}
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
                          r={payload.isSelected ? 5 : (payload.isToday ? 4 : 3)}
                          fill={payload.isSelected ? '#F59E0B' : '#10B981'}
                          stroke={payload.isSelected || payload.isToday ? '#fff' : 'none'}
                          strokeWidth={payload.isSelected || payload.isToday ? 2 : 0}
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

      {/* Recent Meals History */}
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
