import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, ChevronRight, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { SkeletonMealItem } from './ui/skeleton';
import { useLongPressDelete } from '@/hooks/useLongPress';
import { useMinDelay } from '@/hooks/useMinDelay';
import { LazyImage } from './LazyImage';
import { type Meal } from '@/db';
import { Language, Theme } from '@/types';

interface MealListProps {
  meals: Meal[];
  language: Language;
  theme: Theme;
  onMealClick?: (meal: Meal) => void;
  onMealDelete?: (mealId: string) => void;
  isLoading?: boolean;
}

interface MealGroup {
  date: string;
  label: string;
  meals: Meal[];
}

/**
 * Group meals by date (today, yesterday, earlier)
 */
function groupMealsByDate(meals: Meal[], language: Language): MealGroup[] {
  const groups: Record<string, MealGroup> = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  meals.forEach((meal) => {
    const mealDate = new Date(meal.createdAt);
    mealDate.setHours(0, 0, 0, 0);

    const dateKey = mealDate.toISOString().split('T')[0];

    if (!groups[dateKey]) {
      let label = dateKey;

      if (mealDate.getTime() === today.getTime()) {
        label = language === Language.ZH ? '今天' : 'Today';
      } else if (mealDate.getTime() === yesterday.getTime()) {
        label = language === Language.ZH ? '昨天' : 'Yesterday';
      } else {
        // Format as MM/DD
        const month = mealDate.getMonth() + 1;
        const day = mealDate.getDate();
        label = `${month}/${day}`;
      }

      groups[dateKey] = {
        date: dateKey,
        label,
        meals: [],
      };
    }

    groups[dateKey].meals.push(meal);
  });

  // Convert to array and sort by date descending
  return Object.values(groups).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get time string from date
 */
function getTimeString(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Meal nutrition summary
 */
function getNutritionSummary(meal: Meal): { calories: number; protein: number; fat: number; carbs: number } {
  const nutrition = meal.analysis?.nutrition || { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };
  return {
    calories: nutrition.calories || 0,
    protein: nutrition.protein || 0,
    fat: nutrition.fat || 0,
    carbs: nutrition.carbohydrates || 0,
  };
}

/**
 * Individual Meal Item Component
 * Separated to avoid hooks-in-loop issue
 */
interface MealItemProps {
  meal: Meal;
  index: number;
  language: Language;
  theme: Theme;
  onMealClick?: (meal: Meal) => void;
  onMealDelete?: (mealId: string) => void;
  onLongPressStart?: (mealId: string) => void;
  onLongPressEnd?: (mealId: string) => void;
  isLongPressing: boolean;
  itemVariants: any;
}

function MealItem({
  meal,
  index,
  language,
  theme,
  onMealClick,
  onMealDelete,
  onLongPressStart,
  onLongPressEnd,
  isLongPressing,
  itemVariants,
}: MealItemProps) {
  const nutrition = getNutritionSummary(meal);
  const foodName = meal.analysis?.foodName ||
    (language === Language.ZH ? '未知食物' : 'Unknown Food');
  const cuisine = meal.analysis?.cuisine || '';

  // Long press delete hook - called at component top level (Rules of Hooks compliant)
  const { getProps: longPressProps, progress } = useLongPressDelete({
    onDelete: () => {
      if (onMealDelete && confirm(language === Language.ZH ? '确定要删除这条记录吗？' : 'Delete this meal?')) {
        onMealDelete(meal.id);
      }
      onLongPressEnd?.(meal.id);
    },
    threshold: 500,
    onProgress: (prog) => {
      if (prog > 0) {
        onLongPressStart?.(meal.id);
      } else if (isLongPressing) {
        onLongPressEnd?.(meal.id);
      }
    },
  });

  return (
    <motion.div
      key={meal.id}
      variants={itemVariants}
      custom={index}
    >
      <div className="relative">
        {/* Progress indicator for long press */}
        {isLongPressing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 bg-destructive/90 rounded-2xl flex items-center justify-center"
          >
            <Trash2 className="text-white mr-2" size={20} />
            <span className="text-white font-medium text-sm">
              {language === Language.ZH ? '松开删除' : 'Release to Delete'}
            </span>
          </motion.div>
        )}

        {/* Progress overlay */}
        {isLongPressing && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-destructive z-10"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.02 }}
            style={{ borderRadius: '0 0 12px 12px' }}
          />
        )}

        <Card
          className={`p-3 transition-transform cursor-pointer ${
            theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'
          }`}
          onClick={() => {
            if (!isLongPressing) {
              onMealClick?.(meal);
            }
          }}
          {...longPressProps()}
        >
          <div className="flex items-center space-x-3">
            {/* Thumbnail with LazyImage */}
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              {meal.imageUrl ? (
                <LazyImage
                  src={meal.thumbnailUrl || meal.imageUrl}
                  alt={foodName}
                  className="w-full h-full"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Clock size={24} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Food Name */}
              <h4 className={`font-semibold text-sm mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {foodName}
              </h4>

              {/* Cuisine */}
              {cuisine && (
                <div className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {cuisine}
                </div>
              )}

              {/* Nutrition & Time */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <Flame size={12} className="text-orange-500" />
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                    {nutrition.calories} kcal
                  </span>
                </div>
                <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  {getTimeString(meal.createdAt)}
                </div>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight
              size={20}
              className={theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}
            />
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

/**
 * MealList Component - Displays meal history grouped by date
 */
export function MealList({ meals, language, theme, onMealClick, onMealDelete, isLoading }: MealListProps) {
  const groupedMeals = useMemo(() => {
    return groupMealsByDate(meals, language);
  }, [meals, language]);

  const [longPressMealId, setLongPressMealId] = useState<string | null>(null);
  const { showSkeleton } = useMinDelay(isLoading, 300);

  // Show skeleton if loading or within minimum delay (prevents flash)
  if (showSkeleton) {
    return (
      <div className="space-y-6 px-4 py-4">
        {[1, 2].map((groupIdx) => (
          <div key={groupIdx} className="space-y-3">
            {/* Date header skeleton */}
            <div className="h-4 w-20 bg-muted rounded animate-shimmer" />

            {/* Meal items skeleton */}
            {[1, 2].map((itemIdx) => (
              <Card
                key={itemIdx}
                className={`p-3 ${theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'}`}
              >
                <SkeletonMealItem />
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {language === Language.ZH ? '还没有记录' : 'No Meals Yet'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === Language.ZH
            ? '拍照记录你的第一餐吧'
            : 'Take a photo to start tracking your meals'}
        </p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 px-4 py-4"
    >
      {groupedMeals.map((group) => (
        <div key={group.date} className="space-y-3">
          {/* Date Header */}
          <div className={`text-sm font-semibold px-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {group.label}
          </div>

          {/* Meals in this group */}
          {group.meals.map((meal, index) => (
            <MealItem
              key={meal.id}
              meal={meal}
              index={index}
              language={language}
              theme={theme}
              onMealClick={onMealClick}
              onMealDelete={onMealDelete}
              onLongPressStart={setLongPressMealId}
              onLongPressEnd={() => setLongPressMealId(null)}
              isLongPressing={longPressMealId === meal.id}
              itemVariants={itemVariants}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
}
