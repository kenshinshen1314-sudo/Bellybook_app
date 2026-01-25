/**
 * All Users Dishes Modal
 * Displays flat list of user+cuisine combinations sorted by dish count
 * Using Vibe Design System with neumorphic cards and Apple Spring animations
 */

import React, { useState } from 'react';
import { X, Trophy, ChefHat, Calendar, Utensils, ChevronRight, Crown } from 'lucide-react';
import { Language, Theme } from '@/types';
import { useAllUsersDishes } from '@/hooks/useAllUsersDishes';
import { RankingPeriod } from '@/api/ranking';
import { motion, AnimatePresence } from 'framer-motion';
import { UserUnlockedDishesModal } from './UserUnlockedDishesModal';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/shared/UserAvatar';
import type { UserCuisineStats } from '@/api/ranking';

interface AllUsersDishesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  theme: Theme;
}

const PERIOD_OPTIONS: { value: RankingPeriod; label: { zh: string; en: string } }[] = [
  { value: 'WEEKLY', label: { zh: '本周', en: 'This Week' } },
  { value: 'MONTHLY', label: { zh: '本月', en: 'This Month' } },
  { value: 'YEARLY', label: { zh: '本年', en: 'This Year' } },
  { value: 'ALL_TIME', label: { zh: '总榜', en: 'All Time' } },
];

export function AllUsersDishesModal({
  isOpen,
  onClose,
  language,
  theme,
}: AllUsersDishesModalProps) {
  const { data, period, isLoading, error, setPeriod } = useAllUsersDishes('WEEKLY');
  const [selectedEntry, setSelectedEntry] = useState<UserCuisineStats | null>(null);

  const handlePeriodChange = (newPeriod: RankingPeriod) => {
    setPeriod(newPeriod);
  };

  const handleEntryClick = (entry: UserCuisineStats) => {
    setSelectedEntry(entry);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === Language.ZH ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get medal emoji for rank
  const getMedalEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  // Get medal label
  const getMedalLabel = (rank: number): { zh: string; en: string } => {
    switch (rank) {
      case 1: return { zh: '金牌', en: 'Gold' };
      case 2: return { zh: '银牌', en: 'Silver' };
      case 3: return { zh: '铜牌', en: 'Bronze' };
      default: return { zh: '', en: '' };
    }
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <>
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
              "relative w-full sm:max-w-2xl sm:rounded-3xl h-[100dvh] sm:h-[85vh] flex flex-col",
              isDark ? "bg-[#1C1C1E]" : "bg-white",
              "border-t sm:border border-border"
            )}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between p-6 border-b",
              isDark ? "border-white/10" : "border-[var(--border)]"
            )}>
              <div className="flex-1">
                <h2 className={cn(
                  "text-xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {language === Language.ZH ? '菜系专家详情' : 'Cuisine Experts Detail'}
                </h2>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  {language === Language.ZH ? '按用户+菜系统计菜品数量' : 'Dish count by user + cuisine'}
                </p>
              </div>
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
            </div>

            {/* Period Selector */}
            <div className={cn(
              "p-4 border-b",
              isDark ? "border-white/10" : "border-[var(--border)]"
            )}>
              <div className={cn(
                "flex p-1 rounded-xl gap-1",
                isDark ? "bg-[#2C2C2E]" : "bg-gray-100"
              )}>
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePeriodChange(option.value)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-sm font-medium transition-all",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      period === option.value
                        ? cn(
                            isDark ? "bg-card text-card-foreground" : "bg-card text-card-foreground",
                            "shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                          )
                        : cn(
                            isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900",
                            "hover:bg-black/5"
                          )
                    )}
                  >
                    {option.label[language === Language.ZH ? 'zh' : 'en']}
                  </button>
                ))}
              </div>
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
                  <p className={cn("text-sm text-gray-500")}>{error}</p>
                </div>
              ) : !data || data.entries.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
                  <p className={cn("text-sm text-gray-500")}>
                    {language === Language.ZH
                      ? '该时段暂无菜品记录'
                      : 'No dishes recorded in this period'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className={cn(
                    "grid grid-cols-3 gap-3 mb-6 rounded-2xl p-4",
                    isDark ? "bg-[#2C2C2E]" : "bg-gray-50"
                  )}>
                    <div className="text-center">
                      <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                      <div className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>{data.totalEntries}</div>
                      <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                        {language === Language.ZH ? '条目' : 'Entries'}
                      </div>
                    </div>
                    <div className="text-center">
                      <ChefHat className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                      <div className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>{data.totalUsers}</div>
                      <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                        {language === Language.ZH ? '用户' : 'Users'}
                      </div>
                    </div>
                    <div className="text-center">
                      <Utensils className="w-5 h-5 mx-auto mb-1 text-red-500" />
                      <div className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>{data.totalCuisines}</div>
                      <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                        {language === Language.ZH ? '菜系' : 'Cuisines'}
                      </div>
                    </div>
                  </div>

                  {/* Entries List */}
                  <div className="space-y-3">
                    {data.entries.map((entry, index) => (
                      <motion.div
                        key={`${entry.userId}-${entry.cuisineName}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.03 }}
                      >
                        <div
                          onClick={() => handleEntryClick(entry)}
                          className={cn(
                            "rounded-xl p-4 border cursor-pointer transition-all",
                            "hover:scale-[1.01] active:scale-[0.99]",
                            isDark
                              ? "bg-[#2C2C2E] border-white/10 hover:border-white/20 hover:bg-[#3C3C3E]"
                              : "bg-white border-[var(--border)] hover:border-[var(--input-border)] hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {/* Rank Badge - 统一高度对齐 */}
                            {entry.rank <= 3 ? (
                              <div className={cn(
                                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative",
                                isDark ? "bg-[#3C3C3E]" : "bg-gray-200"
                              )}>
                                <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
                              </div>
                            ) : (
                              <div className={cn(
                                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                isDark ? "bg-[#3C3C3E] text-gray-400" : "bg-gray-200 text-gray-500"
                              )}>
                                {entry.rank}
                              </div>
                            )}

                            {/* User Avatar */}
                            <UserAvatar
                              src={entry.avatarUrl}
                              username={entry.username}
                              size="md"
                              className="flex-shrink-0"
                            />

                            {/* User & Cuisine Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className={cn(
                                "font-semibold truncate",
                                isDark ? "text-white" : "text-gray-900"
                              )}>{entry.username}</h4>
                              <div className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs mt-1",
                                isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
                              )}>
                                <span className="truncate max-w-[150px]">{entry.cuisineName}</span>
                              </div>
                              <div className={cn(
                                "text-xs flex items-center gap-1 mt-1",
                                isDark ? "text-gray-400" : "text-gray-500"
                              )}>
                                <Calendar size={12} />
                                {language === Language.ZH ? '首次' : 'First'}: {formatDate(entry.firstMealAt)}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-col items-center justify-center px-2">
                              <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>{entry.dishCount}</div>
                              <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                                {language === Language.ZH ? '道菜' : 'dishes'}
                              </div>
                            </div>

                            {/* Chevron Right */}
                            <ChevronRight size={20} className={isDark ? "text-gray-500" : "text-gray-400"} />
                          </div>
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

      {/* User Unlocked Dishes Modal */}
      {selectedEntry && (
        <UserUnlockedDishesModal
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          userId={selectedEntry.userId}
          username={selectedEntry.username}
          avatarUrl={selectedEntry.avatarUrl}
          cuisineName={selectedEntry.cuisineName}
          language={language}
          theme={theme}
        />
      )}
    </>
  );
}
