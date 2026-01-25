/**
 * Gourmet Detail Modal
 * Displays detailed information about a gourmet user
 * Shows their cuisine distribution with dish counts and progress bars
 */

import React, { useEffect, useState } from 'react';
import { X, ChefHat, Utensils } from 'lucide-react';
import { Language, Theme } from '@/types';
import { ranking, type RankingPeriod, type AllUsersDishesResponse, type UserCuisineStats } from '@/api/ranking';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { ModalCloseButton } from '@/components/shared/ModalCloseButton';
import { logger } from '@/utils/logger';

interface GourmetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  gourmet: {
    userId: string;
    username: string;
    avatarUrl: string | null;
    cuisineCount: number;
    cuisines?: string[];
  };
  language: Language;
  theme: Theme;
}

interface CuisineDistribution {
  cuisineName: string;
  dishCount: number;
  percentage: number;
}

/**
 * Get progress segments based on cuisine count
 * 1-10: 1 segment, 10-20: 2 segments, 20-30: 3 segments, 30+: 4 segments
 */
function getProgressSegments(cuisineCount: number, isDark: boolean) {
  const segmentCount = cuisineCount <= 0 ? 0 :
                       cuisineCount <= 10 ? 1 :
                       cuisineCount <= 20 ? 2 :
                       cuisineCount <= 30 ? 3 : 4;

  const colors = [
    'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',   // amber-500 to amber-600
    'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',   // green-500 to green-600
    'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',   // blue-500 to blue-600
    'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',   // violet-500 to violet-600
  ];

  return Array.from({ length: segmentCount }, (_, i) => ({
    background: colors[i],
  }));
}

export function GourmetDetailModal({
  isOpen,
  onClose,
  gourmet,
  language,
  theme,
}: GourmetDetailModalProps) {
  const [cuisineDistribution, setCuisineDistribution] = useState<CuisineDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && gourmet.userId) {
      loadUserCuisineData();
    }
  }, [isOpen, gourmet.userId]);

  const loadUserCuisineData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all users dishes data
      const response: AllUsersDishesResponse = await ranking.getAllUsersDishes('ALL_TIME');

      // Filter entries for this specific user
      const userEntries = response.entries.filter(
        entry => entry.userId === gourmet.userId
      );

      // Calculate total dishes for percentage calculation
      const totalDishes = userEntries.reduce((sum, entry) => sum + entry.dishCount, 0);

      // Create distribution data with progress bar percentages
      const distribution: CuisineDistribution[] = userEntries.map(entry => ({
        cuisineName: entry.cuisineName,
        dishCount: entry.dishCount,
        percentage: totalDishes > 0 ? (entry.dishCount / totalDishes) * 100 : 0,
      })).sort((a, b) => b.dishCount - a.dishCount);

      setCuisineDistribution(distribution);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load cuisine data';
      setError(errorMessage);
      logger.error('Failed to load cuisine data:', err);
    } finally {
      setIsLoading(false);
    }
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
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
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
            isDark ? "border-white/10" : "border-[var(--border)]"
          )}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <h2 className={cn(
                  "text-xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {language === Language.ZH ? '美食家详情' : 'Gourmet Detail'}
                </h2>
                <p className={cn(
                  "text-sm mt-1",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  {language === Language.ZH ? '菜系分布详情' : 'Cuisine Distribution Details'}
                </p>
              </div>
            </div>
            <ModalCloseButton onClose={onClose} theme={theme} />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className={cn(
                  "animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
                )}></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
                <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Info Card */}
                <div className={cn(
                  "rounded-2xl p-5 border",
                  isDark ? "bg-card border-border" : "bg-gray-50 border-[var(--border)]"
                )}>
                  <div className="flex items-center gap-4">
                    {/* User Avatar */}
                    <UserAvatar
                      src={gourmet.avatarUrl}
                      username={gourmet.username}
                      size="lg"
                    />

                    {/* User Details */}
                    <div className="flex-1">
                      <h3 className={cn(
                        "text-xl font-bold",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        {gourmet.username}
                      </h3>
                      <div className={cn(
                        "flex items-center gap-2 mt-2",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                        <ChefHat size={16} />
                        <span className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
                          {gourmet.cuisineCount}
                        </span>
                        <span className="text-sm">
                          {language === Language.ZH ? '个菜系已解锁' : 'cuisines unlocked'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cuisine Distribution Card */}
                <div className={cn(
                  "rounded-2xl p-5 border",
                  isDark ? "bg-[#2C2C2E] border-white/10" : "bg-gray-50 border-[var(--border)]"
                )}>
                  <h3 className={cn(
                    "text-lg font-bold mb-4 flex items-center gap-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    <Utensils size={20} />
                    {language === Language.ZH ? '菜系分布' : 'Cuisine Distribution'}
                  </h3>

                  {cuisineDistribution.length === 0 ? (
                    <div className="text-center py-8">
                      {/* Show colored line segments based on cuisine count */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        {getProgressSegments(gourmet.cuisineCount, isDark).map((segment, index) => (
                          <div
                            key={index}
                            className="h-2 rounded-full animate-pulse"
                            style={{
                              width: '60px',
                              background: segment.background,
                            }}
                          />
                        ))}
                      </div>
                      <p className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-500")}>
                        {gourmet.cuisineCount} {language === Language.ZH ? '个菜系已解锁' : 'cuisines unlocked'}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
                        {language === Language.ZH
                          ? '正在同步详细数据...'
                          : 'Syncing detailed data...'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cuisineDistribution.map((item, index) => (
                        <motion.div
                          key={`${item.cuisineName}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "font-medium text-sm",
                                isDark ? "text-white" : "text-gray-900"
                              )}>
                                {item.cuisineName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                                  {item.dishCount}
                                </span>
                                <span className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
                                  {language === Language.ZH ? '道菜' : 'dishes'}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className={cn(
                              "h-2 rounded-full overflow-hidden",
                              isDark ? "bg-[#3C3C3E]" : "bg-gray-200"
                            )}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 + 0.1 }}
                                className="h-full rounded-full"
                                style={{
                                  background: 'linear-gradient(90deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, black) 100%)'
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
