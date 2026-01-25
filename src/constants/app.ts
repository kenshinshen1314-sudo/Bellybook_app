/**
 * [INPUT]: 无依赖
 * [OUTPUT]: 对外提供应用级常量配置
 * [POS]: constants/ 的应用配置层，被整个项目消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { AppView } from '@/types';

// ============================================================
// 视图路由导航常量
// ============================================================

/**
 * 默认视图
 */
export const DEFAULT_VIEW = AppView.MAIN_TABS;

/**
 * 需要底部 TabBar 的视图
 */
export const TAB_BAR_VIEWS = new Set<AppView>([
  AppView.MAIN_TABS,
  AppView.PASSPORT_CUISINE_DETAIL,
  AppView.PASSPORT_DISH_DETAIL,
]);

/**
 * 需要返回按钮的视图
 */
export const BACK_BUTTON_VIEWS = new Set<AppView>([
  AppView.ANALYSIS_RESULT,
  AppView.SOCIAL_EXPERTS_LIST,
  AppView.SOCIAL_RANKING_LIST,
  AppView.SOCIAL_USER_DETAIL,
  AppView.PASSPORT_CUISINE_DETAIL,
  AppView.PASSPORT_DISH_DETAIL,
  AppView.PROFILE_EDIT,
  AppView.PROFILE_APPEARANCE,
  AppView.PROFILE_LANGUAGE,
  AppView.PROFILE_NOTIFICATIONS,
  AppView.PROFILE_PRIVACY,
  AppView.PROFILE_SYNC,
  AppView.DESIGN_SYSTEM,
]);

// ============================================================
// 动画配置常量
// ============================================================

/**
 * 页面切换动画配置
 */
export const PAGE_TRANSITION_CONFIG = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.3,
};

/**
 * Tab 切换动画配置
 */
export const TAB_TRANSITION_CONFIG = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

/**
 * 元素淡入动画配置
 */
export const FADE_IN_CONFIG = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.2,
};

// ============================================================
// UI 配置常量
// ============================================================

/**
 * 下拉刷新阈值（像素）
 */
export const PULL_TO_REFRESH_THRESHOLD = 80;

/**
 * 下拉刷新触发距离（像素）
 */
export const PULL_TO_REFRESH_TRIGGER_DISTANCE = 60;

/**
 * TabBar 隐藏滚动阈值（像素）
 */
export const TAB_BAR_HIDE_THRESHOLD = 30;

/**
 * TabBar 隐藏延迟（毫秒）
 */
export const TAB_BAR_HIDE_DELAY = 150;

/**
 * 滑动导航阈值（像素）
 */
export const SWIPE_NAVIGATION_THRESHOLD = 50;

/**
 * 骨架屏最小显示时间（毫秒）
 */
export const SKELETON_MIN_DELAY = 300;

// ============================================================
// 业务配置常量
// ============================================================

/**
 * 默认用户 ID（离线模式）
 */
export const DEFAULT_USER_ID = 'current-user';

/**
 * 每日分析限制
 */
export const DAILY_ANALYSIS_LIMIT = 3;

/**
 * 餐食列表默认分页大小
 */
export const MEALS_PAGE_SIZE = 20;

/**
 * 后端 API 请求超时（毫秒）
 */
export const API_TIMEOUT = 30000;

/**
 * 图片上传最大尺寸（MB）
 */
export const MAX_IMAGE_SIZE_MB = 10;

/**
 * 图片压缩质量 (0-1)
 */
export const IMAGE_COMPRESSION_QUALITY = 0.8;
