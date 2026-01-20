/**
 * Gourmet Ranking Modal
 * Displays users with most diverse cuisines sorted by cuisine count
 * Using Vibe Design System with neumorphic cards and Apple Spring animations
 */

import React, { useState } from 'react';
import { X, Trophy, Users, ChevronRight } from 'lucide-react';
import { Language, Theme } from '@/types';
import { useGourmets } from '@/hooks/useGourmets';
import { RankingPeriod, type GourmetEntry } from '@/api/ranking';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GourmetDetailModal } from './GourmetDetailModal';

interface GourmetRankingModalProps {
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

export function GourmetRankingModal({
  isOpen,
  onClose,
  language,
  theme,
}: GourmetRankingModalProps) {
  const { gourmets, totalUsers, period, isLoading, error, setPeriod } = useGourmets(language, 'WEEKLY');
  const [selectedGourmet, setSelectedGourmet] = useState<GourmetEntry | null>(null);

  const handlePeriodChange = (newPeriod: RankingPeriod) => {
    setPeriod(newPeriod);
  };

  const handleGourmetClick = (gourmet: GourmetEntry) => {
    setSelectedGourmet(gourmet);
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

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
            "relative w-full sm:max-w-lg sm:rounded-3xl h-[100dvh] sm:h-[85vh] flex flex-col",
            isDark ? "bg-[#1C1C1E]" : "bg-white",
            "border-t sm:border border-border"
          )}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between p-6 border-b",
            isDark ? "border-white/10" : "border-gray-200"
          )}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <h2 className={cn(
                  "text-xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {language === Language.ZH ? '美食家榜' : 'Gourmet Ranking'}
                </h2>
              </div>
              <p className={cn(
                "text-sm mt-1",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                {language === Language.ZH ? '解锁菜系最多的环球美食家' : 'Global gourmets with most diverse cuisines'}
              </p>
              <div className={cn(
                "text-xs mt-1 flex items-center gap-1",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>
                <Users size={12} />
                {language === Language.ZH ? `共 ${totalUsers} 位用户` : `Total ${totalUsers} users`}
              </div>
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
            isDark ? "border-white/10" : "border-gray-200"
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
                          isDark ? "bg-white text-black" : "bg-white text-black",
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
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{error}</p>
              </div>
            ) : gourmets.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                  {language === Language.ZH
                    ? '该时段暂无美食家数据'
                    : 'No gourmet data for this period'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {gourmets.map((gourmet, index) => {
                  const rank = gourmet.rank || index + 1;
                  const hasMedal = rank <= 3;

                  return (
                    <motion.div
                      key={gourmet.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                    >
                      <div
                        onClick={() => handleGourmetClick(gourmet)}
                        className={cn(
                          "rounded-xl p-4 border transition-all cursor-pointer",
                          "hover:scale-[1.01] active:scale-[0.99]",
                          isDark
                            ? "bg-[#2C2C2E] border-white/10 hover:border-white/20 hover:bg-[#3C3C3E]"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank Badge - 统一高度对齐 */}
                          {hasMedal ? (
                            <div className={cn(
                              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative",
                              isDark ? "bg-[#3C3C3E]" : "bg-gray-200"
                            )}>
                              <span className="text-2xl">{getMedalEmoji(rank)}</span>
                            </div>
                          ) : (
                            <div className={cn(
                              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold",
                              isDark ? "bg-[#3C3C3E] text-gray-400" : "bg-gray-200 text-gray-500"
                            )}>
                              {rank}
                            </div>
                          )}

                          {/* User Avatar */}
                          {gourmet.avatarUrl ? (
                            <img
                              src={gourmet.avatarUrl}
                              alt={gourmet.username}
                              className={cn(
                                "w-14 h-14 rounded-full object-cover flex-shrink-0",
                                "shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                              )}
                            />
                          ) : (
                            <div className={cn(
                              "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0",
                              "bg-gradient-to-br from-amber-400 to-orange-500",
                              "shadow-[0_4px_12px_rgba(245,158,11,0.35)]"
                            )}>
                              {gourmet.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              "font-semibold truncate text-base",
                              isDark ? "text-white" : "text-gray-900"
                            )}>
                              {gourmet.username}
                            </h4>
                            <div className={cn(
                              "text-sm mt-1",
                              isDark ? "text-gray-400" : "text-gray-500"
                            )}>
                              {gourmet.cuisines && gourmet.cuisines.length > 0
                                ? `${gourmet.cuisines.slice(0, 3).join(', ')}${gourmet.cuisines.length > 3 ? '...' : ''}`
                                : language === Language.ZH ? '暂无菜系' : 'No cuisines yet'}
                            </div>
                          </div>

                          {/* Cuisine Count */}
                          <div className="flex flex-col items-center justify-center px-3">
                            <div className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                              {gourmet.cuisineCount}
                            </div>
                            <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                              {language === Language.ZH ? '个菜系' : 'cuisines'}
                            </div>
                          </div>

                          {/* Chevron Right */}
                          <ChevronRight size={20} className={isDark ? "text-gray-500" : "text-gray-400"} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Gourmet Detail Modal */}
        {selectedGourmet && (
          <GourmetDetailModal
            isOpen={!!selectedGourmet}
            onClose={() => setSelectedGourmet(null)}
            gourmet={selectedGourmet}
            language={language}
            theme={theme}
          />
        )}
      </div>
    </AnimatePresence>
  );
}
