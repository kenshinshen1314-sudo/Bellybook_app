import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UIComponents';
import { MealList } from '../../components/MealList';
import { StripCalendar } from '../../components/StripCalendar';
import { MealDetailModal } from '../../components/MealDetailModal';
import { Language, TEXT, Theme } from '../../types';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LabelList, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Sun, CloudSun, Moon, Coffee, ChevronLeft, ChevronRight, Calendar, Flame, UtensilsCrossed, TrendingUp, Sparkles } from 'lucide-react';
import { useMeals } from '@/hooks/useMeals';
import { useToastNotification } from '@/contexts/ToastContext';
import { useMinDelay } from '@/hooks/useMinDelay';
import { translateCuisine } from '../../utils/translationUtils';

interface Tab2HistoryProps {
  lang: Language;
  isPremium: boolean;
  onUpgrade: () => void;
  theme: Theme;
  refreshTrigger?: number;
  userId?: string;
}

// Meal time colors (constants can stay outside)
const MEAL_TIME_COLORS = {
  breakfast: 'bg-orange-100 text-orange-600',
  lunch: 'bg-yellow-100 text-yellow-600',
  dinner: 'bg-indigo-100 text-indigo-600',
  snack: 'bg-pink-100 text-pink-600',
};

// Garnish ingredients to filter out (same as Tab1Home)
const GARNISH_INGREDIENTS = ['葱花', '香菜', '辣椒', '花椒', '芝麻', '葱', '蒜', '姜', '小葱'];

// Default ingredient icons mapping (same as Tab1Home)
const INGREDIENT_ICONS: Record<string, string> = {
  '红薯': '🍠',
  '红薯块': '🍠',
  '香肠': '🌭',
  '肉条': '🥓',
  '猪肉': '🥩',
  '牛肉': '🥩',
  '鸡肉': '🍗',
  '鸭肉': '🦆',
  '鱼肉': '🐟',
  '虾': '🦐',
  '蟹': '🦀',
  '蛋': '🥚',
  '豆腐': '🧈',
  '蘑菇': '🍄',
  '青菜': '🥬',
  '白菜': '🥬',
  '菠菜': '🥬',
  '番茄': '🍅',
  '土豆': '🥔',
  '胡萝卜': '🥕',
  '面包': '🍞',
  '奶酪': '🧀',
  '水果': '🍎',
  '米饭': '🍚',
  '面条': '🍜',
};

// Get icon for ingredient
function getIngredientIcon(name: string): string {
  // Try exact match first
  if (INGREDIENT_ICONS[name]) return INGREDIENT_ICONS[name];
  // Try partial match
  for (const [key, icon] of Object.entries(INGREDIENT_ICONS)) {
    if (name.includes(key) || key.includes(name)) return icon;
  }
  return '🍽️'; // Default food icon
}

// Get ingredient description based on name
function getIngredientDescription(name: string, lang: Language): string {
  const descriptions: Record<string, { zh: string; en: string }> = {
    '红薯块': { zh: '红薯原产于美洲，明代传入中国后迅速普及，成为重要的粮食作物', en: 'Sweet potato originated from Americas, introduced to China in Ming Dynasty' },
    '红薯': { zh: '红薯原产于美洲，明代传入中国后迅速普及，成为重要的粮食作物', en: 'Sweet potato originated from Americas' },
    '香肠': { zh: '香肠在德国有悠久历史，可追溯至古罗马时期。德国香肠种类繁多', en: 'Sausages have a long history in Germany, dating back to ancient Rome' },
    '肉条': { zh: '肉条源于美洲，作为便携的高蛋白食品，是传统保存肉类的方式', en: 'Meat strips originated from Americas as portable high-protein food' },
    '猪肉': { zh: '猪肉是世界上消费量最大的肉类之一，富含优质蛋白质和B族维生素', en: 'Pork is one of the most consumed meats worldwide, rich in protein' },
    '牛肉': { zh: '牛肉含有丰富的蛋白质和铁质，是优质的红肉来源', en: 'Beef is rich in protein and iron, an excellent red meat source' },
    '鸡肉': { zh: '鸡肉是低脂高蛋白的优质肉类，易于消化吸收', en: 'Chicken is a lean, high-protein meat that is easy to digest' },
    '鸭肉': { zh: '鸭肉肉质细嫩，富含不饱和脂肪酸，是传统的滋补食材', en: 'Duck meat is tender and rich in unsaturated fatty acids' },
    '鱼肉': { zh: '鱼肉富含优质蛋白质和Omega-3脂肪酸，对心血管健康有益', en: 'Fish is rich in high-quality protein and Omega-3 fatty acids' },
    '虾': { zh: '虾肉富含蛋白质和钙质，肉质鲜美，营养丰富', en: 'Shrimp is rich in protein and calcium with delicious taste' },
    '蟹': { zh: '蟹肉含有丰富的蛋白质和微量元素，秋季食蟹是中华传统', en: 'Crab meat is rich in protein and trace elements' },
    '蛋': { zh: '鸡蛋是优质蛋白质的来源，含有人体所需的全部必需氨基酸', en: 'Eggs are excellent source of quality protein with all essential amino acids' },
    '豆腐': { zh: '豆腐源于中国，是大豆制品，富含植物蛋白和钙质', en: 'Tofu originated from China, made from soybeans, rich in plant protein' },
    '蘑菇': { zh: '蘑菇富含膳食纤维和多种维生素，是低热量高营养的食材', en: 'Mushrooms are rich in dietary fiber and vitamins, low in calories' },
    '青菜': { zh: '绿叶蔬菜富含维生素、矿物质和膳食纤维，是健康饮食的重要组成部分', en: 'Leafy greens are rich in vitamins, minerals and dietary fiber' },
    '白菜': { zh: '白菜是中国最常见的蔬菜之一，口感清爽，营养丰富', en: 'Chinese cabbage is one of the most common vegetables in China' },
    '菠菜': { zh: '菠菜富含铁质和叶酸，对造血功能有益，被誉为"营养模范生"', en: 'Spinach is rich in iron and folic acid, beneficial for blood production' },
    '番茄': { zh: '番茄富含番茄红素和维生素C，具有抗氧化作用', en: 'Tomatoes are rich in lycopene and vitamin C with antioxidant properties' },
    '土豆': { zh: '土豆是全球第四大粮食作物，富含淀粉和膳食纤维', en: 'Potato is the fourth largest food crop globally, rich in starch' },
    '胡萝卜': { zh: '胡萝卜富含β-胡萝卜素，对视力和免疫力有益', en: 'Carrots are rich in beta-carotene, beneficial for vision and immunity' },
    '面包': { zh: '面包是西方的主食，由面粉发酵烘焙而成，富含碳水化合物', en: 'Bread is a Western staple made from fermented and baked flour' },
    '奶酪': { zh: '奶酪是浓缩的牛奶制品，富含蛋白质和钙质', en: 'Cheese is a concentrated dairy product rich in protein and calcium' },
    '水果': { zh: '水果富含维生素、矿物质和膳食纤维，是健康饮食的重要组成部分', en: 'Fruits are rich in vitamins, minerals and dietary fiber' },
    '米饭': { zh: '米饭是东亚地区的主食，提供人体所需的主要能量来源', en: 'Rice is the staple food in East Asia, providing main energy source' },
    '面条': { zh: '面条源于中国，已有四千年历史，是全球广泛喜爱的面食', en: 'Noodles originated from China with 4000 years of history' },
  };

  const desc = descriptions[name];
  if (desc) return lang === Language.ZH ? desc.zh : desc.en;
  return lang === Language.ZH ? `${name}是常见的食材，营养丰富` : `${name} is a common ingredient with rich nutrition`;
}

/**
 * Ingredient Card for "食物多样性" section
 */
function IngredientCard({
  name,
  description,
  icon,
  theme,
  index
}: {
  name: string;
  description: string;
  icon: string;
  theme: Theme;
  index: number;
}) {
  const cardBg = theme === 'dark' ? 'bg-[#2C2C2E]' : 'bg-[#F5F0E8]';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const descColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`${cardBg} rounded-2xl p-4 min-w-[140px] max-w-[160px]`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-bold ${textColor} px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/70'}`}>
          {name}
        </span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-xs ${descColor} line-clamp-2 leading-relaxed`}>
        {description}
      </p>
    </motion.div>
  );
}

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
  elementRef?: React.RefObject<HTMLDivElement>; // DOM element ref for direct manipulation
}

const Tab2History: React.FC<Tab2HistoryProps> = ({ lang, isPremium, onUpgrade, theme, refreshTrigger, userId }) => {
  console.log('[Tab2History] Render:', { lang, userId, refreshTrigger });
  const t = TEXT[lang];
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const textTitle = theme === 'dark' ? 'text-white/90' : 'text-black/90';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textTertiary = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
  const cardBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';
  const axisColor = theme === 'dark' ? '#555' : '#ddd';
  const tooltipBg = theme === 'dark' ? '#333' : '#fff';
  const tooltipColor = theme === 'dark' ? '#fff' : '#000';

  // Meal time icons (defined inside component to avoid JSX-in-const issues)
  const MEAL_TIME_ICONS = {
    breakfast: <Sun size={20} />,
    lunch: <CloudSun size={20} />,
    dinner: <Moon size={20} />,
    snack: <Coffee size={20} />,
  };

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Modal state
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  // Energy balls state - using ref-based animation for performance
  const containerRef = useRef<HTMLDivElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]); // Store balls for initial render and nutrition updates
  const ballsRef = useRef<Ball[]>([]); // Store balls in ref for animation to avoid re-renders
  const ballElementsRef = useRef<Map<string, HTMLDivElement>>(new Map()); // Map of ball IDs to DOM elements
  const animationRef = useRef<number>();
  const isAnimatingRef = useRef(false);
  const isVisibleRef = useRef(true); // Track visibility to pause animation when off-screen
  const lastFrameTimeRef = useRef<number>(0); // For frame rate throttling
  const collisionEffectsRef = useRef<Map<string, { scale: number; opacity: number }>>(new Map()); // Visual effects for collisions

  // Load meals from IndexedDB - use userId from props to get correct user's meals
  const { meals, isLoading: mealsLoading, deleteMeal, updateMeal, getMealsByDateRange, refresh } = useMeals(userId);
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

  /**
   * Handle meal click - open detail modal
   */
  const handleMealClick = (meal: any) => {
    setSelectedMeal(meal);
  };

  /**
   * Handle meal update from modal
   */
  const handleUpdateMeal = async (updatedMeal: any) => {
    try {
      await updateMeal(updatedMeal);
      setSelectedMeal(updatedMeal);
    } catch (error) {
      console.error('[Tab2History] Failed to update meal:', error);
      showError(
        lang === Language.ZH ? '更新失败' : 'Update Failed',
        lang === Language.ZH ? '请重试' : 'Please try again'
      );
    }
  };

  /**
   * Handle meal delete from modal
   */
  const handleDeleteFromModal = async (meal: any) => {
    try {
      await deleteMeal(meal.id);
      setSelectedMeal(null);
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
    // Use local time for date comparison (not UTC)
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    // Create start and end in local time
    const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999);

    const filtered = meals.filter(m => {
      const mealDate = new Date(m.createdAt);
      return mealDate >= startOfDay && mealDate <= endOfDay;
    });

    return filtered;
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
  }, [selectedDateMealsByTime, meals, selectedDate]); // Add meals and selectedDate to ensure updates

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
    // Reset to midnight using local time
    monday.setHours(0, 0, 0, 0);

    const data = [];

    for (let i = 0; i < 7; i++) {
      // Clone monday and add i days
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      // Get meals for this day
      const dayMeals = meals.filter(m => {
        const mealDate = new Date(m.createdAt);
        return mealDate >= dayStart && mealDate <= dayEnd;
      });

      // Sum up calories and macros
      const totalCal = dayMeals.reduce((sum, meal) => {
        return sum + (meal.analysis?.nutrition?.calories || 0);
      }, 0);

      const totalProtein = dayMeals.reduce((sum, meal) => {
        return sum + (meal.analysis?.nutrition?.protein || 0);
      }, 0);

      const totalFat = dayMeals.reduce((sum, meal) => {
        return sum + (meal.analysis?.nutrition?.fat || 0);
      }, 0);

      const totalCarbs = dayMeals.reduce((sum, meal) => {
        return sum + (meal.analysis?.nutrition?.carbohydrates || 0);
      }, 0);

      data.push({
        day: days[dayStart.getDay()],
        date: dayStart.getDate(),
        cal: totalCal,
        protein: Math.round(totalProtein),
        fat: Math.round(totalFat),
        carbs: Math.round(totalCarbs),
        isToday: dayStart.toDateString() === new Date().toDateString(),
        isSelected: dayStart.toDateString() === selectedDate.toDateString(),
      });
    }

    return data;
  }, [meals, lang, selectedDate]);

  // Generate cuisine statistics data
  const cuisineStatsData = useMemo(() => {
    // Count meals by cuisine
    const cuisineCountMap = new Map<string, number>();

    meals.forEach(meal => {
      const cuisine = meal.analysis?.cuisine;
      if (cuisine && cuisine.trim()) {
        const count = cuisineCountMap.get(cuisine) || 0;
        cuisineCountMap.set(cuisine, count + 1);
      }
    });

    // Convert to array and sort by count (descending)
    const data = Array.from(cuisineCountMap.entries())
      .map(([cuisine, count]) => ({
        cuisine: translateCuisine(cuisine, lang),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 cuisines

    return data;
  }, [meals, lang]);

  // Cuisine icon mapping
  const getCuisineIcon = (cuisineName: string): string => {
    const name = cuisineName.toLowerCase();
    // Chinese cuisines
    if (name.includes('川') || name.includes('sichuan') || name.includes('chuan')) return '🌶️';
    if (name.includes('粤') || name.includes('cantonese') || name.includes('yue')) return '🥟';
    if (name.includes('湘') || name.includes('hunan') || name.includes('xiang')) return '🌶️';
    if (name.includes('鲁') || name.includes('shandong') || name.includes('lu')) return '🍲';
    if (name.includes('浙') || name.includes('zhejiang') || name.includes('zhe')) return '🐟';
    if (name.includes('苏') || name.includes('jiangsu') || name.includes('su')) return '🍜';
    if (name.includes('闽') || name.includes('fujian') || name.includes('min')) return '🦐';
    if (name.includes('徽') || name.includes('anhui') || name.includes('hui')) return '🥬';
    // Asian cuisines
    if (name.includes('日') || name.includes('日本') || name.includes('japan') || name.includes('japanese')) return '🍣';
    if (name.includes('韩') || name.includes('韩国') || name.includes('korea') || name.includes('korean')) return '🍲';
    if (name.includes('泰') || name.includes('泰国') || name.includes('thai') || name.includes('thailand')) return '🍜';
    if (name.includes('印度') || name.includes('india') || name.includes('indian')) return '🍛';
    if (name.includes('越南') || name.includes('vietnam') || name.includes('vietnamese')) return '🥢';
    // Western cuisines
    if (name.includes('意') || name.includes('意大利') || name.includes('italy') || name.includes('italian')) return '🍕';
    if (name.includes('美') || name.includes('美国') || name.includes('america') || name.includes('american')) return '🍔';
    if (name.includes('法') || name.includes('法国') || name.includes('france') || name.includes('french')) return '🥐';
    if (name.includes('英') || name.includes('英国') || name.includes('british') || name.includes('english')) return '🍝';
    if (name.includes('德') || name.includes('德国') || name.includes('german') || name.includes('germany')) return '🥨';
    if (name.includes('西班牙') || name.includes('spain') || name.includes('spanish')) return '🥘';
    // Others
    if (name.includes('墨西哥') || name.includes('mexico') || name.includes('mexican')) return '🌮';
    if (name.includes('地中海') || name.includes('mediterranean')) return '🫒';
    if (name.includes('中东') || name.includes('middle') || name.includes('eastern')) return '🧆';
    // Default
    return '🍽️';
  };

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
  }, [caloriesByMealTime, selectedDateMealsByTime, lang, meals, selectedDate]); // Add meals and selectedDate to ensure updates

  // Generate meal pattern data for scatter plot (current week, starting from Monday)
  const mealPatternData = useMemo(() => {
    // Get the current week's dates (Monday to Sunday)
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate the Monday of the current week
    const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const mondayOfThisWeek = new Date(today);
    mondayOfThisWeek.setDate(today.getDate() - distanceToMonday);
    mondayOfThisWeek.setHours(0, 0, 0, 0);

    // Calculate the Sunday of the current week (end of the week)
    const sundayOfThisWeek = new Date(mondayOfThisWeek);
    sundayOfThisWeek.setDate(mondayOfThisWeek.getDate() + 6);
    sundayOfThisWeek.setHours(23, 59, 59, 999);

    // Filter meals from this week
    const thisWeekMeals = meals.filter(meal => {
      const mealDate = new Date(meal.createdAt);
      return mealDate >= mondayOfThisWeek && mealDate <= sundayOfThisWeek;
    });

    // Convert to scatter plot data
    // x: day of week (0-6, where 0=Monday, 1=Tuesday, ..., 6=Sunday), y: hour in decimal (6-24)
    const data = thisWeekMeals.map(meal => {
      const mealDate = new Date(meal.createdAt);
      const dayOfWeek = mealDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      // Convert to Monday-based: Monday=0, Tuesday=1, ..., Sunday=6
      const xValue = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const hours = mealDate.getHours();
      const minutes = mealDate.getMinutes();
      const timeDecimal = hours + minutes / 60; // Convert to decimal for y-axis

      return {
        x: xValue,
        y: timeDecimal,
        date: mealDate,
        mealId: meal.id,
        timeStr: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        z: 1, // Size of dots
      };
    });

    return { data, weekStart: mondayOfThisWeek };
  }, [meals]);

  // Calculate food diversity stats (total types and this week's new additions)
  const foodDiversityStats = useMemo(() => {
    // Get the current week's dates (Monday to Sunday)
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate the Monday of the current week
    const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const mondayOfThisWeek = new Date(today);
    mondayOfThisWeek.setDate(today.getDate() - distanceToMonday);
    mondayOfThisWeek.setHours(0, 0, 0, 0);

    // Extract all unique ingredients from all meals (for ingredient cards)
    const ingredientMap = new Map<string, { name: string; icon: string; description: string }>();

    meals.forEach(meal => {
      (meal.analysis?.ingredients || []).forEach(ing => {
        // Filter out garnishes
        if (!GARNISH_INGREDIENTS.some(g => ing.name.includes(g))) {
          if (!ingredientMap.has(ing.name)) {
            ingredientMap.set(ing.name, {
              name: ing.name,
              icon: ing.icon || getIngredientIcon(ing.name),
              description: ing.description || getIngredientDescription(ing.name, lang)
            });
          }
        }
      });
    });

    const allIngredients = Array.from(ingredientMap.values());

    // Calculate this week's new ingredients
    const thisWeekIngredients = new Set<string>();
    const beforeThisWeekIngredients = new Set<string>();

    meals.forEach(meal => {
      const mealDate = new Date(meal.createdAt);
      const isThisWeek = mealDate >= mondayOfThisWeek;

      (meal.analysis.ingredients || []).forEach(ing => {
        if (!GARNISH_INGREDIENTS.some(g => ing.name.includes(g))) {
          if (isThisWeek) {
            thisWeekIngredients.add(ing.name);
          } else {
            beforeThisWeekIngredients.add(ing.name);
          }
        }
      });
    });

    // New this week = ingredients that appear this week but not before
    const newThisWeek = Array.from(thisWeekIngredients).filter(
      ing => !beforeThisWeekIngredients.has(ing)
    ).length;

    return {
      totalTypes: allIngredients.length,
      newThisWeek: newThisWeek,
      ingredients: allIngredients,
    };
  }, [meals, lang]);

  // Initialize energy balls - update both state and ref
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

    // Update both state (for rendering) and ref (for animation)
    setBalls(newBalls);
    ballsRef.current = newBalls;

    // Reset collision effects and animation flag to restart animation
    collisionEffectsRef.current.clear();
    isAnimatingRef.current = false; // Allow animation to restart
  }, [selectedDateNutrition, lang]);

  // Physics simulation loop - ref-based for performance
  // Direct DOM manipulation instead of React re-renders
  useEffect(() => {
    // Only start animation if we have balls and animation isn't already running
    if (ballsRef.current.length === 0 || isAnimatingRef.current) return;

    const containerWidth = 320;
    const containerHeight = 200;
    const TARGET_FPS = 60;
    const FRAME_TIME = 1000 / TARGET_FPS;

    // Helper function to directly update DOM element position
    const updateBallPosition = (ballId: string, x: number, y: number, radius: number, scale: number = 1, opacity: number = 1) => {
      const element = ballElementsRef.current.get(ballId);
      if (element) {
        element.style.transform = `translate(${x - radius}px, ${y - radius}px) scale(${scale})`;
        element.style.opacity = opacity.toString();
      }
    };

    // Helper function to create collision effect (scale pulse)
    const triggerCollisionEffect = (ballId: string) => {
      collisionEffectsRef.current.set(ballId, { scale: 1.2, opacity: 0.8 });
    };

    // Update collision effects animation
    const updateCollisionEffects = () => {
      const effectsToRemove: string[] = [];
      collisionEffectsRef.current.forEach((effect, ballId) => {
        effect.scale += (1 - effect.scale) * 0.15; // Smooth return to normal
        effect.opacity += (1 - effect.opacity) * 0.15;
        if (Math.abs(effect.scale - 1) < 0.01) {
          effectsToRemove.push(ballId);
        }
      });
      effectsToRemove.forEach(id => collisionEffectsRef.current.delete(id));
    };

    const animate = (timestamp: number) => {
      // Throttle frame rate to reduce CPU usage
      if (timestamp - lastFrameTimeRef.current < FRAME_TIME) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = timestamp;

      // Pause animation if container is not visible (performance optimization)
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const balls = ballsRef.current;
      if (balls.length === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Update positions
      balls.forEach(ball => {
        ball.x += ball.vx;
        ball.y += ball.vy;
      });

      // Boundary collision with bounce effect
      balls.forEach(ball => {
        let collided = false;
        // Left/right boundaries
        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.vx = Math.abs(ball.vx) * 0.9; // Bounce with slight energy loss
          collided = true;
        } else if (ball.x + ball.radius > containerWidth) {
          ball.x = containerWidth - ball.radius;
          ball.vx = -Math.abs(ball.vx) * 0.9;
          collided = true;
        }

        // Top/bottom boundaries
        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy = Math.abs(ball.vy) * 0.9;
          collided = true;
        } else if (ball.y + ball.radius > containerHeight) {
          ball.y = containerHeight - ball.radius;
          ball.vy = -Math.abs(ball.vy) * 0.9;
          collided = true;
        }

        // Trigger visual effect on boundary collision
        if (collided) {
          triggerCollisionEffect(ball.id);
        }
      });

      // Ball-to-ball collision detection and response
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const ball1 = balls[i];
          const ball2 = balls[j];

          const dx = ball2.x - ball1.x;
          const dy = ball2.y - ball1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = ball1.radius + ball2.radius;

          if (distance < minDistance && distance > 0) {
            // Collision detected - exchange velocities using elastic collision physics
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // Rotate velocities to collision coordinate system
            const vx1 = ball1.vx * cos + ball1.vy * sin;
            const vy1 = ball1.vy * -sin + ball1.vy * cos;
            const vx2 = ball2.vx * cos + ball2.vy * sin;
            const vy2 = ball2.vy * -sin + ball2.vy * cos;

            // Elastic collision formula (mass proportional to area)
            const m1 = ball1.radius * ball1.radius;
            const m2 = ball2.radius * ball2.radius;
            const newVx1 = ((m1 - m2) * vx1 + 2 * m2 * vx2) / (m1 + m2);
            const newVx2 = ((m2 - m1) * vx2 + 2 * m1 * vx1) / (m1 + m2);

            // Rotate back to original coordinate system
            ball1.vx = newVx1 * cos - vy1 * sin;
            ball1.vy = vy1 * cos + newVx1 * sin;
            ball2.vx = newVx2 * cos - vy2 * sin;
            ball2.vy = vy2 * cos + newVx2 * sin;

            // Separate balls to prevent sticking (overlap resolution)
            const overlap = minDistance - distance;
            const separationX = (overlap / 2 + 0.5) * cos; // Add small buffer
            const separationY = (overlap / 2 + 0.5) * sin;
            ball1.x -= separationX;
            ball1.y -= separationY;
            ball2.x += separationX;
            ball2.y += separationY;

            // Trigger collision visual effect
            triggerCollisionEffect(ball1.id);
            triggerCollisionEffect(ball2.id);

            // Add minimum velocity boost on collision to keep things dynamic
            const speedBoost = 0.3;
            if (Math.abs(ball1.vx) + Math.abs(ball1.vy) < 1.5) {
              ball1.vx += (Math.random() - 0.5) * speedBoost;
              ball1.vy += (Math.random() - 0.5) * speedBoost;
            }
            if (Math.abs(ball2.vx) + Math.abs(ball2.vy) < 1.5) {
              ball2.vx += (Math.random() - 0.5) * speedBoost;
              ball2.vy += (Math.random() - 0.5) * speedBoost;
            }
          }
        }
      }

      // Ensure minimum movement (prevent balls from stopping)
      const minSpeed = 0.4;
      const maxSpeed = 2.5;
      balls.forEach(ball => {
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (speed < minSpeed) {
          // Add random small impulse
          ball.vx += (Math.random() - 0.5) * 0.2;
          ball.vy += (Math.random() - 0.5) * 0.2;
        } else if (speed > maxSpeed) {
          // Cap maximum speed for stability
          ball.vx = (ball.vx / speed) * maxSpeed;
          ball.vy = (ball.vy / speed) * maxSpeed;
        }
      });

      // Update collision effects
      updateCollisionEffects();

      // Direct DOM update - much faster than React re-render
      balls.forEach(ball => {
        const effect = collisionEffectsRef.current.get(ball.id);
        updateBallPosition(
          ball.id,
          ball.x,
          ball.y,
          ball.radius,
          effect?.scale || 1,
          effect?.opacity || 1
        );
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mark animation as running and start it
    isAnimatingRef.current = true;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      // Cleanup: cancel animation and mark as not running
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      isAnimatingRef.current = false;
    };
    // Run when balls state changes (to trigger after initialization)
  }, [balls]);

  // Intersection Observer for visibility detection (pause animation when off-screen)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Cleanup ball elements on unmount
  useEffect(() => {
    return () => {
      ballElementsRef.current.clear();
      collisionEffectsRef.current.clear();
    };
  }, []);

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
      {/* Strip Calendar */}
      <StripCalendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        lang={lang}
        theme={theme}
      />

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
          {balls && balls.length > 0 && balls.map(ball => (
            <div
              key={ball.id}
              ref={(el) => {
                if (el) ballElementsRef.current.set(ball.id, el);
                else ballElementsRef.current.delete(ball.id);
              }}
              className="absolute flex flex-col items-center justify-center text-center cursor-pointer hover:scale-110 transition-transform duration-200"
              style={{
                left: 0,
                top: 0,
                width: ball.radius * 2,
                height: ball.radius * 2,
                willChange: 'transform, opacity', // Hint to browser for optimization
              }}
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
            </div>
          ))}
        </div>

        {/* Fixed Legend at Bottom */}
        <div className="flex justify-center gap-4 mt-3">
          {balls && balls.length > 0 && balls.map(ball => (
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

      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH
            ? `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`
            : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {lang === Language.ZH ? '餐食' : 'Meals'}
        </h2>
        {selectedDateMeals.length === 0 ? (
          <Card theme={theme} className={`${cardBg} p-8`}>
            <div className="flex flex-col items-center justify-center text-center py-8">
              <div className={`w-16 h-16 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                <UtensilsCrossed size={32} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
              </div>
              <p className={`text-lg font-medium ${textTitle} mb-2`}>
                {lang === Language.ZH ? '今天还没有记录餐食' : 'No meals recorded today'}
              </p>
              <p className={`text-sm ${textSecondary}`}>
                {lang === Language.ZH
                  ? '去首页拍照记录第一餐吧！'
                  : 'Go to the home page to record your first meal!'}
              </p>
            </div>
          </Card>
        ) : (
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
        )}
      </div>

      {/* Recent Meals History */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH ? '最近记录' : 'Recent Meals'}
        </h2>
        <MealList
          meals={selectedDateMeals}
          language={lang}
          theme={theme}
          isLoading={mealsLoading}
          onMealClick={handleMealClick}
          onMealDelete={handleDeleteMeal}
          hideDateHeaders
        />
      </div>

      {/* Weekly Trend Chart */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH ? '营养趋势' : 'Nutrition Trend'}
        </h2>
        <Card theme={theme} className={`${cardBg} p-4`}>
          <div className="h-80 w-full flex flex-col">
            {/* Line Chart - Calories */}
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="caloriesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="caloriesAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    width={40}
                    domain={[0, 2000]}
                    tickCount={5}
                    interval={0}
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
                    stroke="url(#caloriesGradient)"
                    strokeWidth={3}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      return (
                        <g>
                          {payload.isSelected && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={10}
                              fill="#F97316"
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
                            fill={payload.isSelected ? '#F97316' : '#10B981'}
                            stroke={payload.isSelected || payload.isToday ? '#fff' : 'none'}
                            strokeWidth={payload.isSelected || payload.isToday ? 2 : 0}
                          />
                        </g>
                      );
                    }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Macros */}
            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="proteinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                      <stop offset="100%" stopColor="#DC2626" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="fatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                      <stop offset="100%" stopColor="#D97706" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="carbsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                    </linearGradient>
                  </defs>
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
                    width={40}
                    tickFormatter={(value) => `${value}g`}
                    interval={0}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: '10px',
                      paddingTop: '0px',
                    }}
                  />
                  <Bar dataKey="protein" name="protein" stackId="macros" fill="url(#proteinGradient)" barSize={16} />
                  <Bar dataKey="fat" name="fat" stackId="macros" fill="url(#fatGradient)" barSize={16} />
                  <Bar dataKey="carbs" name="carbs" stackId="macros" fill="url(#carbsGradient)" barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* Cuisine Exploration */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH ? '菜系探索' : 'Cuisine Exploration'}
        </h2>
        <Card theme={theme} className={`${cardBg} p-4`}>
          <div className="w-full" style={{ height: Math.max(200, cuisineStatsData.length * 36) }}>
            {cuisineStatsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cuisineStatsData}
                  layout="vertical"
                  margin={{ top: 5, right: 5, left: 10, bottom: 5 }}
                  barCategoryGap={2}
                >
                  <defs>
                    <linearGradient id="cuisineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F97316" stopOpacity={1} />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="cuisineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FB923C" stopOpacity={1} />
                      <stop offset="100%" stopColor="#F97316" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="cuisineGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FDBA74" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FB923C" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="cuisineGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FED7AA" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FDBA74" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient id="cuisineGradient5" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFEDD5" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FED7AA" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={axisColor} opacity={0.15} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 10 }}
                    tickFormatter={(value) => Math.round(value)}
                    domain={[0, 10]}
                    interval={0}
                    allowDecimals={false}
                    tickCount={11}
                    orientation="bottom"
                  />
                  <YAxis
                    type="category"
                    dataKey="cuisine"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 11, textAnchor: 'end', x: -5 }}
                    width={90}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  >
                    {cuisineStatsData.map((entry, index) => {
                      // Warm orange gradient palette (5 levels) - appetizing colors
                      const gradients = [
                        'url(#cuisineGradient1)',
                        'url(#cuisineGradient2)',
                        'url(#cuisineGradient3)',
                        'url(#cuisineGradient4)',
                        'url(#cuisineGradient5)',
                      ];
                      return <Cell key={`cell-${index}`} fill={gradients[index % gradients.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {lang === Language.ZH
                      ? '记录更多美食，探索不同菜系'
                      : 'Record more meals to explore cuisines'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Meal Pattern */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH ? '用餐规律' : 'Meal Pattern'}
        </h2>
        <Card theme={theme} className={`${cardBg} p-4`}>
          <div className="h-72 w-full">
            {mealPatternData.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  data={mealPatternData.data}
                  margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={axisColor} opacity={0.15} />
                  <XAxis
                    type="number"
                    dataKey="x"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 10 }}
                    tickFormatter={(value) => {
                      // value is day of week (0=Monday, 1=Tuesday, ..., 6=Sunday)
                      const dayNames = lang === Language.ZH
                        ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      return dayNames[value];
                    }}
                    domain={[0, 6]}
                    ticks={[0, 1, 2, 3, 4, 5, 6]}
                    interval={0}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: axisColor, fontSize: 10 }}
                    tickFormatter={(value) => {
                      const hours = Math.floor(value);
                      const minutes = Math.round((value - hours) * 60);
                      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    }}
                    domain={[6, 24]}
                    ticks={[6, 9, 12, 15, 18, 21, 24]}
                    interval={0}
                    orientation="right"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      color: tooltipColor,
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: 11,
                    }}
                    formatter={(value: any, name: string, props: any) => {
                      if (name === 'y') {
                        const hours = Math.floor(value);
                        const minutes = Math.round((value - hours) * 60);
                        return [`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`, lang === Language.ZH ? '时间' : 'Time'];
                      }
                      if (name === 'x') {
                        const dayNames = lang === Language.ZH
                          ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                        return [dayNames[value], lang === Language.ZH ? '日期' : 'Date'];
                      }
                      return [value, name];
                    }}
                    labelFormatter={() => {
                      return lang === Language.ZH ? '用餐时间' : 'Meal Time';
                    }}
                  />
                  <Scatter
                    dataKey="y"
                    fill="#10B981"
                    shape="circle"
                    r={5}
                  >
                    {mealPatternData.data.map((entry, index) => {
                      // Use different colors based on time of day
                      let color = '#10B981'; // Default green
                      if (entry.y >= 6 && entry.y < 10) {
                        color = '#FBBF24'; // Breakfast - yellow
                      } else if (entry.y >= 10 && entry.y < 14) {
                        color = '#F97316'; // Late morning/Lunch - orange
                      } else if (entry.y >= 14 && entry.y < 18) {
                        color = '#EF4444'; // Afternoon - red
                      } else if (entry.y >= 18 && entry.y < 21) {
                        color = '#8B5CF6'; // Dinner - purple
                      } else {
                        color = '#6366F1'; // Late night - indigo
                      }
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {lang === Language.ZH
                      ? '记录更多用餐，发现你的饮食规律'
                      : 'Record more meals to discover your patterns'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Food Diversity */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH ? '食物多样性' : 'Food Diversity'}
        </h2>
        <Card theme={theme} className={`${cardBg} p-4`}>
          {/* Stats Section */}
          <div className="flex items-center justify-around mb-4">
            {/* Total Types */}
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${theme === 'dark' ? 'bg-gradient-to-br from-primary/20 to-primary/5' : 'bg-gradient-to-br from-primary/10 to-primary/5'}`}>
                <UtensilsCrossed className={`w-8 h-8 ${theme === 'dark' ? 'text-primary' : 'text-primary'}`} />
              </div>
              <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {foodDiversityStats.totalTypes}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {lang === Language.ZH ? '食物总类' : 'Total Types'}
              </div>
            </div>

            {/* Divider */}
            <div className={`w-px h-20 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />

            {/* New This Week */}
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${theme === 'dark' ? 'bg-gradient-to-br from-orange-500/20 to-orange-500/5' : 'bg-gradient-to-br from-orange-500/10 to-orange-500/5'}`}>
                <Sparkles className={`w-8 h-8 text-orange-500`} />
              </div>
              <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {foodDiversityStats.newThisWeek}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {lang === Language.ZH ? '本周新增' : 'New This Week'}
              </div>
            </div>
          </div>

          {/* Divider Line */}
          <div className={`h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} my-4`} />

          {/* Ingredient Cards - Horizontal Scroll */}
          {foodDiversityStats.ingredients.length > 0 ? (
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
                {foodDiversityStats.ingredients.map((ingredient, index) => (
                  <IngredientCard
                    key={ingredient.name}
                    name={ingredient.name}
                    description={ingredient.description}
                    icon={ingredient.icon}
                    theme={theme}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="text-center">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {lang === Language.ZH
                    ? '记录更多餐食，发现你的食物多样性'
                    : 'Record more meals to discover your food diversity'}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          isOpen={!!selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onUpdate={handleUpdateMeal}
          onDelete={handleDeleteFromModal}
          onShare={() => console.log('Share meal')}
          lang={lang}
          theme={theme}
        />
      )}
    </div>
  );
};

export default Tab2History;
