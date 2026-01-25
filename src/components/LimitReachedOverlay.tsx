/**
 * [INPUT]: 依赖 react, framer-motion, types 的 Language, hooks 的 useThemeStyles
 * [OUTPUT]: 对外提供 LimitReachedOverlay 组件，显示每日分析次数已达上限的提示
 * [POS]: components/ 的提示覆盖层组件，被 App 和 Premium 页面消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Language } from '../types';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { DAILY_ANALYSIS_LIMIT } from '../constants/app';
import { AVATAR_STYLES } from '@/styles/neumorphic';

interface LimitReachedOverlayProps {
  onDismiss: () => void;
  lang: Language;
}

/**
 * LimitReachedOverlay - 每日分析次数上限提示
 *
 * 重构日志：
 * - 移除硬编码颜色值 (#1C1C1E, white, gray-300 等)
 * - 使用 useThemeStyles Hook 获取主题样式
 * - 使用 CSS 变量替代具体颜色值
 */
export const LimitReachedOverlay: React.FC<LimitReachedOverlayProps> = ({ onDismiss, lang }) => {
  const styles = useThemeStyles('dark'); // 始终使用暗色主题（覆盖层）

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`${styles.bgCard} rounded-3xl overflow-hidden w-full max-w-[320px] shadow-2xl relative cursor-pointer group`}
        onClick={onDismiss}
      >
        <div className="relative h-80">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop"
            alt="Limit Reached"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent opacity-80`} />
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--card)] opacity-90`} />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-center pb-10">
            {/* Lock Icon */}
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-[var(--card-foreground)]" style={AVATAR_STYLES}>
              <span className="text-2xl">🔒</span>
            </div>

            {/* Title */}
            <h2 className={`text-xl font-bold ${styles.textTitle} mb-3`}>
              {lang === Language.ZH ? '今日分析次数已用完' : 'Daily Limit Reached'}
            </h2>

            {/* Description */}
            <p className={`text-xs ${styles.textSecondary} leading-relaxed font-medium opacity-90`}>
              {lang === Language.ZH
                ? `免费用户每天可分析${DAILY_ANALYSIS_LIMIT}餐，升级会员无限分析，尽情解锁你的美食经纬`
                : `Free users can analyze ${DAILY_ANALYSIS_LIMIT} meals per day. Upgrade for unlimited access and unlock your gourmet journey.`
              }
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
