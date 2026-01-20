/**
 * Cuisine Expert Detail Modal
 * Displays all dishes for a specific user in a specific cuisine
 * Using Vibe Design System with neumorphic cards and Apple Spring animations
 */

import React, { useState } from 'react';
import { X, Calendar, Clock, Utensils } from 'lucide-react';
import { Language, Theme } from '@/types';
import { useCuisineExpertDetail } from '@/hooks/useCuisineExpertDetail';
import { ranking, type RankingPeriod } from '@/api/ranking';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CuisineExpertDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  cuisineName: string;
  language: Language;
  theme: Theme;
}

const PERIOD_OPTIONS: { value: RankingPeriod; label: { zh: string; en: string } }[] = [
  { value: 'WEEKLY', label: { zh: '本周', en: 'This Week' } },
  { value: 'MONTHLY', label: { zh: '本月', en: 'This Month' } },
  { value: 'YEARLY', label: { zh: '本年', en: 'This Year' } },
  { value: 'ALL_TIME', label: { zh: '总榜', en: 'All Time' } },
];

export function CuisineExpertDetailModal({
  isOpen,
  onClose,
  userId,
  username,
  cuisineName,
  language,
  theme,
}: CuisineExpertDetailModalProps) {
  const [period, setPeriod] = useState<RankingPeriod>('ALL_TIME');
  const { detail, isLoading, error } = useCuisineExpertDetail(userId, cuisineName, period);

  const handlePeriodChange = (newPeriod: RankingPeriod) => {
    setPeriod(newPeriod);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === Language.ZH ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={cn(
            "relative w-full sm:max-w-2xl sm:rounded-3xl bg-card h-[100dvh] sm:h-[85vh] flex flex-col",
            "border-t sm:border border-border"
          )}
        >
          {/* Header */}
          <div className={cn("flex items-center justify-between p-6 border-b border-border")}>
            <div className="flex-1">
              <h2 className={cn("text-xl font-bold text-foreground")}>{username}</h2>
              <p className={cn("text-sm text-muted-foreground")}>
                {language === Language.ZH ? `${cuisineName}专家` : `${cuisineName} Expert`}
              </p>
            </div>
            <button
              onClick={onClose}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center bg-muted",
                "hover:scale-[1.02] active:scale-[0.98] transition-all"
              )}
            >
              <X size={20} className="text-foreground" />
            </button>
          </div>

          {/* Period Selector */}
          <div className={cn("p-4 border-b border-border flex gap-2 overflow-x-auto")}>
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value)}
                className={cn(
                  "px-4 py-2 rounded-2xl text-sm font-medium transition-all whitespace-nowrap",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  period === option.value
                    ? cn(
                        "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground",
                        "shadow-[0_4px_12px_color-mix(in_srgb,var(--primary)_35%,_transparent),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.1)]"
                      )
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label[language === Language.ZH ? 'zh' : 'en']}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className={cn("animate-spin rounded-full h-8 w-8 border-b-2 border-primary")}></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                <p className={cn("text-sm text-muted-foreground")}>{error}</p>
              </div>
            ) : !detail || detail.dishes.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                <p className={cn("text-sm text-muted-foreground")}>
                  {language === Language.ZH
                    ? '该时段暂无菜品记录'
                    : 'No dishes recorded in this period'}
                </p>
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <Card variant="inset" className="grid grid-cols-2 gap-4 mb-6 p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{detail.totalDishes}</div>
                    <div className={cn("text-xs text-muted-foreground")}>
                      {language === Language.ZH ? '菜品' : 'Dishes'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{detail.totalMeals}</div>
                    <div className={cn("text-xs text-muted-foreground")}>
                      {language === Language.ZH ? '餐食' : 'Meals'}
                    </div>
                  </div>
                </Card>

                {/* Dishes List */}
                <div className="space-y-3">
                  <h3 className={cn("text-sm font-semibold text-muted-foreground")}>
                    {language === Language.ZH ? '菜品列表' : 'Dish List'}
                  </h3>
                  {detail.dishes.map((dish, index) => (
                    <motion.div
                      key={`${dish.dishName}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                    >
                      <Card variant="raised" className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Dish Image */}
                          {dish.imageUrl ? (
                            <img
                              src={dish.imageUrl}
                              alt={dish.dishName}
                              className={cn(
                                "w-16 h-16 rounded-xl object-cover flex-shrink-0",
                                "shadow-[0_4px_12px_color-mix(in_srgb,var(--primary)_25%,_transparent),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.05)]"
                              )}
                            />
                          ) : (
                            <div className={cn(
                              "w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/70",
                              "flex items-center justify-center flex-shrink-0",
                              "shadow-[0_4px_12px_color-mix(in_srgb,var(--primary)_35%,_transparent),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.1)]"
                            )}>
                              <Utensils size={24} className="text-white" />
                            </div>
                          )}

                          {/* Dish Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className={cn("font-semibold text-foreground truncate")}>{dish.dishName}</h4>
                            <div className={cn("text-xs text-muted-foreground mt-1")}>
                              {dish.calories && (
                                <span className="mr-3">
                                  {language === Language.ZH ? '热量' : 'Calories'}: {dish.calories} kcal
                                </span>
                              )}
                            </div>
                            <div className={cn("text-xs text-muted-foreground mt-1 flex items-center gap-2")}>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {language === Language.ZH ? '首次' : 'First'}: {formatDate(dish.firstMealAt)}
                              </span>
                              {dish.lastMealAt && (
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {language === Language.ZH ? '最近' : 'Last'}: {formatDate(dish.lastMealAt)}
                                </span>
                              )}
                            </div>
                            {dish.notes && (
                              <p className={cn("text-xs mt-2 text-muted-foreground line-clamp-2")}>{dish.notes}</p>
                            )}
                          </div>

                          {/* Meal Count Badge */}
                          <div className="flex flex-col items-center justify-center px-3">
                            <div className="text-2xl font-bold text-primary">{dish.mealCount}</div>
                            <div className={cn("text-xs text-muted-foreground")}>
                              {language === Language.ZH ? '次' : 'times'}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
