/**
 * Conflict Banner Component
 *
 * Shows notification banner when sync conflicts are detected
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useConflicts } from '@/hooks/useConflicts';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Theme, type Language } from '@/types';

interface ConflictBannerProps {
  language: Language;
  theme: Theme;
  onResolveClick?: () => void;
}

export function ConflictBanner({ language, theme, onResolveClick }: ConflictBannerProps) {
  const styles = useThemeStyles(theme);
  const { stats, pendingConflicts } = useConflicts();
  const [isExpanded, setIsExpanded] = useState(false);

  const getText = (zh: string, en: string) => (language === 'zh' ? zh : en);

  if (stats.pending === 0) {
    return null;
  }

  const bgColor = theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200';
  const textColor = theme === 'dark' ? 'text-amber-400' : 'text-amber-700';
  const iconColor = theme === 'dark' ? 'text-amber-400' : 'text-amber-600';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isExpanded ? 'auto' : 56, opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 right-0 z-[200] border-b ${bgColor}`}
        style={{ marginTop: 'env(safe-area-inset-top)' }}
      >
        {/* Header - Always visible */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <AlertTriangle size={20} className={iconColor} />
            </motion.div>
            <div>
              <p className={`text-sm font-medium ${textColor}`}>
                {getText('同步冲突', 'Sync Conflicts')}
              </p>
              <p className={`text-xs ${textColor} opacity-80`}>
                {getText(
                  `${stats.pending} 条记录需要解决`,
                  `${stats.pending} record${stats.pending > 1 ? 's' : ''} need resolution`
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-xs opacity-60"
              >
                <span>{getText('点击查看', 'Tap to view')}</span>
                <ChevronRight size={14} />
              </motion.div>
            )}

            {isExpanded && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  onResolveClick?.();
                }}
                className="h-7 text-xs"
              >
                {getText('解决冲突', 'Resolve')}
              </Button>
            )}
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-3"
            >
              <div className="space-y-2">
                {pendingConflicts.slice(0, 3).map((conflict) => (
                  <div
                    key={conflict.id}
                    className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-black/20' : 'bg-white'} border ${styles.border}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${textColor}`}>
                        {conflict.entityType === 'meal'
                          ? getText('餐食记录', 'Meal')
                          : conflict.entityType === 'profile'
                            ? getText('个人资料', 'Profile')
                            : getText('设置', 'Settings')}
                      </span>
                      <span className={`text-[10px] opacity-60 ${textColor}`}>
                        {new Date(conflict.clientUpdatedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-[10px] opacity-70 ${textColor}`}>
                      {getText(
                        '本地和服务器同时修改了此记录',
                        'Modified locally and on server'
                      )}
                    </p>
                  </div>
                ))}

                {stats.pending > 3 && (
                  <p className={`text-xs text-center opacity-60 ${textColor}`}>
                    {getText(
                      `还有 ${stats.pending - 3} 条冲突...`,
                      `And ${stats.pending - 3} more conflict${stats.pending - 3 > 1 ? 's' : ''}...`
                    )}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="flex-1"
                >
                  {getText('稍后处理', 'Later')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    onResolveClick?.();
                  }}
                  className="flex-1"
                >
                  {getText('立即解决', 'Resolve Now')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close button (only when expanded) */}
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className={`absolute top-3 right-3 p-1 rounded-full ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'} transition-colors`}
          >
            <X size={16} className={textColor} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
