import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, ChevronRight, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { SkeletonMealItem } from './ui/skeleton';
import { useLongPressDelete } from '@/hooks/useLongPress';
import { useMinDelay } from '@/hooks/useMinDelay';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { LazyImage } from './LazyImage';
import { type Meal } from '@/db';
import { Language, Theme } from '@/types';
import { translateDishName, translateCuisine } from '@/utils/translationUtils';
import { logger } from '@/utils/logger';

interface MealListProps {
  meals: Meal[];
  language: Language;
  theme: Theme;
  onMealClick?: (meal: Meal) => void;
  onMealDelete?: (mealId: string) => void;
  isLoading?: boolean;
  hideDateHeaders?: boolean;
  // Note: dishToCuisineMap is no longer needed - cuisine is now directly
  // available at meal.analysis.dishes[0].cuisine from the backend API
  dishToCuisineMap?: Map<string, string>;
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
  dishToCuisineMap?: Map<string, string>;
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
  // dishToCuisineMap is no longer used but kept for backward compatibility
}: MealItemProps) {
  const styles = useThemeStyles(theme);
  const nutrition = getNutritionSummary(meal);

  // Get food name from dishes array (new data structure) or foodName (old structure)
  // When multiple dishes are detected, concatenate all dish names
  const getDishName = (): string => {
    const dishes = meal.analysis?.dishes;
    if (dishes && dishes.length > 0) {
      // Get all dish names and join them with "、" (Chinese enumeration comma)
      const dishNames = dishes
        .map(d => d.foodName || d.name || '')
        .filter(name => name.trim() !== '');
      return dishNames.join('、');
    }
    return meal.analysis?.foodName || '';
  };

  const foodName = translateDishName(
    getDishName() || (language === Language.ZH ? '未知食物' : 'Unknown Food'),
    language
  );

  // Get correct cuisine for this meal - simplified approach
  // The cuisine is already available at meal.analysis.dishes[0].cuisine
  const cuisine = (() => {
    const dishes = meal.analysis?.dishes;
    // Direct access to dishes[0].cuisine which has the correct value
    if (dishes && dishes.length > 0 && dishes[0].cuisine) {
      return translateCuisine(dishes[0].cuisine, language);
    }
    // Fallback to meal.analysis.cuisine (may be empty)
    return translateCuisine(meal.analysis?.cuisine || '', language);
  })();

  // Get image URL - prefer thumbnail for list view, fallback to full image
  const displayImageUrl = meal.thumbnailUrl || meal.imageUrl || '';

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
            style={{ borderRadius: '0 0 20px 20px' }}
          />
        )}

        <Card
          className={`p-3 transition-transform cursor-pointer ${styles.bgCard}`}
          onClick={() => {
            if (!isLongPressing) {
              onMealClick?.(meal);
            }
          }}
          {...longPressProps()}
        >
          <div className="flex items-center space-x-3">
            {/* Thumbnail with LazyImage */}
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              {displayImageUrl ? (
                <>
                  <img
                    src={displayImageUrl}
                    alt={foodName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      logger.error('Image failed to load:', {
                        mealId: meal.id,
                        foodName,
                        imageUrl: displayImageUrl?.substring(0, 100),
                      });
                    }}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col text-xs p-1">
                  <Clock size={16} />
                  <span className="mt-1 text-[10px] text-gray-400">No Image</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Food Name */}
              <h4 className={`font-semibold text-sm mb-1 truncate ${styles.textTitle}`}>
                {foodName}
              </h4>

              {/* Cuisine */}
              {cuisine && (
                <div className={`text-xs mb-2 ${styles.textSecondary}`}>
                  {cuisine}
                </div>
              )}

              {/* Nutrition & Time */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <Flame size={12} className="text-orange-500" />
                  <span className={styles.textSecondary}>
                    {Math.round(nutrition.calories)} kcal
                  </span>
                </div>
                <div className={styles.textTertiary}>
                  {getTimeString(meal.createdAt)}
                </div>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight
              size={20}
              className={styles.textTertiary}
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
export function MealList({ meals, language, theme, onMealClick, onMealDelete, isLoading, hideDateHeaders, dishToCuisineMap }: MealListProps) {
  const styles = useThemeStyles(theme);
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
                className={`p-3 ${styles.bgCard}`}
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
          {!hideDateHeaders && (
            <div className={`text-sm font-semibold px-2 ${styles.textSecondary}`}>
              {group.label}
            </div>
          )}

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
              dishToCuisineMap={dishToCuisineMap}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
}
