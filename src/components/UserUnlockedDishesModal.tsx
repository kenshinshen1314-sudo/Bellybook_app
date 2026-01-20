/**
 * User Unlocked Dishes Modal
 * Displays all dishes unlocked by a specific user in a specific cuisine
 * Using Vibe Design System with neumorphic cards and Apple Spring animations
 */

import React from 'react';
import { X, Utensils, Camera, Calendar, ChefHat } from 'lucide-react';
import { Language, Theme } from '@/types';
import { useCuisineExpertDetail } from '@/hooks/useCuisineExpertDetail';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UserUnlockedDishesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  avatarUrl: string | null;
  cuisineName: string;
  language: Language;
  theme: Theme;
}

export function UserUnlockedDishesModal({
  isOpen,
  onClose,
  userId,
  username,
  avatarUrl,
  cuisineName,
  language,
  theme,
}: UserUnlockedDishesModalProps) {
  const { detail: data, isLoading, error } = useCuisineExpertDetail(userId, cuisineName);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === Language.ZH ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
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
            "relative w-full sm:max-w-2xl sm:rounded-3xl h-[100dvh] sm:h-[85vh] flex flex-col",
            isDark ? "bg-[#1C1C1E]" : "bg-white",
            "border-t sm:border border-border"
          )}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between p-6 border-b",
            isDark ? "border-white/10" : "border-gray-200"
          )}>
            <button
              onClick={onClose}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                "hover:scale-[1.02] active:scale-[0.98]",
                isDark ? "bg-[#2C2C2E] hover:bg-[#3C3C3E]" : "bg-gray-100 hover:bg-gray-200"
              )}
            >
              <X size={20} className={isDark ? "text-white" : "text-gray-600"} />
            </button>
            <div className="flex-1 text-center">
              <h2 className={cn(
                "text-xl font-bold",
                isDark ? "text-white" : "text-gray-900"
              )}>
                {username}
              </h2>
              <p className={cn(
                "text-sm mt-1",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                {cuisineName}
              </p>
            </div>
            <div className="w-10" /> {/* Spacer for center alignment */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className={cn(
                  "animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"
                )}></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{error}</p>
              </div>
            ) : !data || data.dishes.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                  {language === Language.ZH
                    ? '暂无解锁的菜肴'
                    : 'No unlocked dishes yet'}
                </p>
              </div>
            ) : (
              <>
                {/* Stats Summary */}
                <div className={cn(
                  "grid grid-cols-2 gap-3 mb-6 rounded-2xl p-4",
                  isDark ? "bg-[#2C2C2E]" : "bg-gray-50"
                )}>
                  <div className="text-center">
                    <ChefHat className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                    <div className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
                      {data.totalDishes}
                    </div>
                    <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                      {language === Language.ZH ? '道菜' : 'Dishes'}
                    </div>
                  </div>
                  <div className="text-center">
                    <Utensils className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <div className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
                      {data.totalMeals}
                    </div>
                    <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                      {language === Language.ZH ? '餐次' : 'Meals'}
                    </div>
                  </div>
                </div>

                {/* Dishes List */}
                <div className="space-y-3">
                  <h3 className={cn(
                    "text-sm font-semibold mb-3 flex items-center gap-2",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    <Utensils size={16} />
                    {language === Language.ZH ? '解锁的菜肴' : 'Unlocked Dishes'}
                  </h3>
                  {data.dishes.map((dish, index) => (
                    <motion.div
                      key={`${dish.dishName}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                    >
                      <div
                        className={cn(
                          "rounded-xl p-4 border",
                          isDark
                            ? "bg-[#2C2C2E] border-white/10"
                            : "bg-white border-gray-200 shadow-sm"
                        )}
                      >
                        <div className="flex gap-4">
                          {/* Dish Image */}
                          {dish.imageUrl ? (
                            <img
                              src={dish.imageUrl}
                              alt={dish.dishName}
                              className={cn(
                                "w-20 h-20 rounded-lg object-cover flex-shrink-0",
                                "shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                              )}
                            />
                          ) : (
                            <div className={cn(
                              "w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0",
                              isDark ? "bg-[#3C3C3E]" : "bg-gray-100"
                            )}>
                              <Camera size={24} className={isDark ? "text-gray-500" : "text-gray-400"} />
                            </div>
                          )}

                          {/* Dish Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              "font-semibold truncate",
                              isDark ? "text-white" : "text-gray-900"
                            )}>
                              {dish.dishName}
                            </h4>
                            <div className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs mt-1",
                              isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
                            )}>
                              {dish.cuisine}
                            </div>
                            <div className={cn(
                              "text-xs flex items-center gap-1 mt-2",
                              isDark ? "text-gray-400" : "text-gray-500"
                            )}>
                              <Calendar size={12} />
                              {language === Language.ZH ? '首次' : 'First'}: {formatDate(dish.firstMealAt)}
                            </div>
                            {dish.lastMealAt && (
                              <div className={cn(
                                "text-xs flex items-center gap-1 mt-1",
                                isDark ? "text-gray-400" : "text-gray-500"
                              )}>
                                <Calendar size={12} />
                                {language === Language.ZH ? '最近' : 'Last'}: {formatDate(dish.lastMealAt)}
                              </div>
                            )}
                          </div>

                          {/* Meal Count */}
                          <div className="flex flex-col items-center justify-center px-2">
                            <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                              {dish.mealCount}
                            </div>
                            <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                              {language === Language.ZH ? '次' : 'times'}
                            </div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        {dish.calories && (
                          <div className={cn(
                            "mt-3 pt-3 border-t",
                            isDark ? "border-white/10" : "border-gray-100"
                          )}>
                            <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                              {language === Language.ZH ? '热量' : 'Calories'}: {dish.calories} kcal
                            </div>
                          </div>
                        )}
                        {dish.notes && (
                          <div className={cn(
                            "mt-2 pt-2 border-t",
                            isDark ? "border-white/10" : "border-gray-100"
                          )}>
                            <div className={cn("text-xs italic", isDark ? "text-gray-400" : "text-gray-500")}>
                              {dish.notes}
                            </div>
                          </div>
                        )}
                      </div>
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
