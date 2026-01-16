import React, { useMemo } from 'react';
import { Card } from '../../components/UIComponents';
import { Language, TEXT, Theme } from '../../types';
import { useMeals } from '@/hooks/useMeals';
import { useAuth } from '@/contexts/AuthContext';
import { UtensilsCrossed } from 'lucide-react';

interface Tab4SocialProps {
  lang: Language;
  theme: Theme;
  onExpertsClick?: () => void;
  onRankingClick?: () => void;
  userId?: string;
}

const Tab4Social: React.FC<Tab4SocialProps> = ({ lang, theme, onExpertsClick, onRankingClick, userId }) => {
  const t = TEXT[lang];
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const { meals, isLoading } = useMeals(userId);
  const { user } = useAuth();

  // Calculate cuisine statistics from user's meals
  const cuisineStats = useMemo(() => {
    const stats = new Map<string, number>();

    meals.forEach(meal => {
      const cuisine = meal.analysis?.cuisine;
      if (cuisine && cuisine.trim()) {
        stats.set(cuisine, (stats.get(cuisine) || 0) + 1);
      }
    });

    // Sort by count (descending)
    return Array.from(stats.entries())
      .map(([cuisine, count], index) => ({
        cuisine,
        count,
        rank: index + 1,
      }))
      .sort((a, b) => b.count - a.count);
  }, [meals]);

  // Total meals count
  const totalMeals = meals.length;

  // Get display name
  const displayName = user?.displayName || (user?.username || (lang === 'zh' ? '我' : 'Me'));

  return (
    <div className={`pb-28 pt-24 px-4 animate-fade-in ${textColor} space-y-8`}>
      {/* Cuisine Experts - 按菜系统计菜品数量，倒序展示 */}
      <div>
         <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold">{t.cuisine_experts}</h2>
            <button
              onClick={onExpertsClick}
              className="text-xs text-gray-500 font-medium"
            >
              {t.details} &gt;
            </button>
         </div>

         {cuisineStats.length === 0 ? (
           <Card theme={theme} className="p-8 text-center">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-gray-500">
                {lang === Language.ZH
                  ? '记录更多餐食，解锁你的菜系成就'
                  : 'Record more meals to unlock your cuisine achievements'}
              </p>
           </Card>
         ) : (
           <div className="space-y-3">
              {cuisineStats.slice(0, 5).map((stat) => {
                // Badge for top 3
                const getBadge = () => {
                  if (stat.rank === 1) return '🥇';
                  if (stat.rank === 2) return '🥈';
                  if (stat.rank === 3) return '🥉';
                  return stat.rank.toString();
                };

                return (
                  <div key={stat.cuisine} className="flex items-center justify-between p-3">
                     <div className="flex items-center flex-1">
                        <div className={`w-8 text-center text-lg mr-3 ${stat.rank <= 3 ? '' : 'text-gray-500'}`}>
                           {getBadge()}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mr-3 text-white text-sm font-bold">
                           {displayName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                           <div className="font-semibold text-sm">{displayName}</div>
                           <div className="text-xs text-gray-500">
                              {stat.cuisine}
                           </div>
                        </div>
                     </div>
                     <div className="text-lg font-bold">{stat.count} <span className="text-sm font-normal text-gray-500">{lang === Language.ZH ? '道菜' : 'dishes'}</span></div>
                  </div>
                );
              })}
           </div>
         )}
      </div>

      {/* Gourmet Ranking - 按用户统计菜系堆叠柱状图 */}
      <div>
         <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold">{t.gourmet_ranking}</h2>
            <span className="text-xs text-gray-500">
              {cuisineStats.length} {lang === Language.ZH ? '种菜系' : 'cuisines'}
            </span>
         </div>
         <Card theme={theme} className="h-80 p-4">
            {cuisineStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                   <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-50" />
                   <p className="text-sm">
                     {lang === Language.ZH
                       ? '记录更多餐食，解锁你的菜系成就'
                       : 'Record more meals to unlock your cuisine achievements'}
                   </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-end justify-center px-4">
                 {(() => {
                    // 按用户分组统计菜系数据
                    const userCuisineData = [
                      {
                        userId: userId || 'current',
                        displayName: displayName,
                        cuisineStats: cuisineStats.map(stat => ({
                          cuisine: stat.cuisine,
                          count: stat.count,
                        }))
                      }
                    ];

                    // 菜系颜色定义 - 柔和质感激变配色
                    const cuisineColors = [
                      'from-amber-300 to-amber-500',      // 柔和琥珀色
                      'from-sky-300 to-sky-500',          // 柔和天蓝色
                      'from-emerald-300 to-emerald-500',  // 柔和翠绿色
                      'from-violet-300 to-violet-500',    // 柔和紫罗兰
                      'from-orange-300 to-orange-500',    // 柔和橙色
                      'from-teal-300 to-teal-500',        // 柔和青色
                      'from-rose-300 to-rose-500',        // 柔和玫瑰色
                      'from-lime-300 to-lime-500',        // 柔和青柠色
                      'from-pink-300 to-pink-500',        // 柔和粉色
                      'from-stone-300 to-stone-500',      // 柔和石灰色
                    ];

                    // 计算每个用户的总菜数，用于缩放
                    const userTotals = userCuisineData.map(user =>
                      user.cuisineStats.reduce((sum, c) => sum + c.count, 0)
                    );
                    const maxTotal = Math.max(...userTotals);
                    const maxBarHeight = 200;
                    const barScale = maxTotal > 0 ? maxBarHeight / maxTotal : 0;

                    return userCuisineData.map((userData, userIndex) => {
                      const totalCount = userData.cuisineStats.reduce((sum, c) => sum + c.count, 0);

                      return (
                        <div key={userData.userId} className="flex flex-col items-center mx-4">
                           {/* 堆叠柱状图 */}
                           <div
                              className="w-16 rounded-t-sm relative flex flex-col-reverse mb-2"
                              style={{ height: `${Math.max(totalCount * barScale, 20)}px`, minHeight: '20px' }}
                           >
                              {userData.cuisineStats.map((cuisineStat, cuisineIndex) => {
                                if (cuisineStat.count === 0) return null;
                                const stackHeight = cuisineStat.count * barScale;
                                const colorClass = cuisineColors[cuisineIndex % cuisineColors.length];

                                return (
                                  <div
                                    key={cuisineStat.cuisine}
                                    className={`w-full bg-gradient-to-t ${colorClass} transition-all duration-300`}
                                    style={{
                                      height: `${Math.max(stackHeight, 2)}px`,
                                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
                                    }}
                                    title={`${cuisineStat.cuisine}: ${cuisineStat.count}`}
                                  >
                                    {stackHeight > 15 && (
                                      <div className="flex items-center justify-center h-full text-[10px] text-white font-medium drop-shadow-sm">
                                        {cuisineStat.count}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                           </div>

                           {/* 用户头像 */}
                           <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mb-1"
                              style={{
                                background: 'linear-gradient(135deg, rgb(251 191 36) 0%, rgb(245 158 11) 100%)',
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
                              }}
                           >
                              {userData.displayName?.charAt(0)?.toUpperCase() || '?'}
                           </div>

                           {/* 菜系数量 */}
                           <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                              {userData.cuisineStats.length} {lang === Language.ZH ? '种菜系' : 'cuisines'}
                           </div>

                           {/* 用户名 */}
                           <div className="text-xs text-gray-500 mt-1 text-center max-w-[80px] truncate">
                              {userData.displayName}
                           </div>
                        </div>
                      );
                    });
                 })()}
              </div>
            )}
         </Card>
      </div>

      {/* Info Banner */}
      <Card theme={theme} className="p-4 text-center">
         <p className="text-xs text-gray-500">
            {lang === Language.ZH
              ? '社区功能正在开发中，即将支持与其他美食爱好者互动'
              : 'Community features coming soon - interact with other food enthusiasts'}
         </p>
      </Card>
    </div>
  );
};

export default Tab4Social;