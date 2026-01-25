import React, { useMemo, useState } from 'react';
import { Card } from '../../components/UIComponents';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { Language, TEXT, Theme } from '../../types';
import { useDishExperts } from '@/hooks/useDishExperts';
import { useUserCuisineBreakdown } from '@/hooks/useUserCuisineBreakdown';
import { useAuth } from '@/contexts/AuthContext';
import { UtensilsCrossed } from 'lucide-react';
import { AllUsersDishesModal } from '@/components/AllUsersDishesModal';
import { GourmetRankingModal } from '@/components/GourmetRankingModal';
import { UserAvatar } from '@/components/shared/UserAvatar';
import type { UserCuisineStats } from '@/api/ranking';

interface Tab4SocialProps {
  lang: Language;
  theme: Theme;
  onExpertsClick?: () => void;
  onRankingClick?: () => void;
  userId?: string;
}

const Tab4Social: React.FC<Tab4SocialProps> = ({ lang, theme, onExpertsClick, onRankingClick, userId }) => {
  const t = TEXT[lang];
  const styles = useThemeStyles(theme);
  // Fetch dish experts from backend API
  const { experts, isLoading } = useDishExperts(lang);
  // Fetch user cuisine breakdown for gourmet ranking (stacked bar chart)
  const { users: gourmetUsers, isLoading: isLoadingGourmetRanking } = useUserCuisineBreakdown(lang, 'ALL_TIME');
  const { user } = useAuth();

  // State for all users dishes modal
  const [showAllUsersDishes, setShowAllUsersDishes] = useState(false);
  // State for gourmet ranking modal
  const [showGourmetRanking, setShowGourmetRanking] = useState(false);

  // Get display name
  const displayName = user?.displayName || (user?.username || (lang === 'zh' ? '我' : 'Me'));

  return (
    <>
      <div className={`pb-28 pt-24 px-4 animate-fade-in ${styles.textTitle} space-y-8`}>
        {/* Cuisine Experts - 按用户统计菜品数量，倒序展示 */}
        <div>
           <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold">{t.cuisine_experts}</h2>
              <button
                onClick={() => setShowAllUsersDishes(true)}
                className="text-xs text-gray-500 font-medium"
              >
                {t.details} &gt;
              </button>
           </div>

           {experts.length === 0 ? (
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
              {experts.slice(0, 5).map((expert) => {
                // Badge for top 3
                const getBadge = () => {
                  if (expert.rank === 1) return '🥇';
                  if (expert.rank === 2) return '🥈';
                  if (expert.rank === 3) return '🥉';
                  return expert.rank.toString();
                };

                return (
                  <div key={expert.userId} className="flex items-center justify-between p-3">
                     <div className="flex items-center flex-1">
                        <div className={`w-8 text-center text-lg mr-3 ${expert.rank <= 3 ? '' : 'text-gray-500'}`}>
                           {getBadge()}
                        </div>
                        <UserAvatar
                          src={expert.avatarUrl}
                          username={expert.username}
                          size="md"
                          className="mr-3"
                        />
                        <div className="flex-1">
                           <div className="font-semibold text-sm">{expert.username}</div>
                           <div className="text-xs text-gray-500">
                              {expert.cuisines && expert.cuisines.length > 0
                                ? `${expert.cuisines.slice(0, 2).join(', ')}${expert.cuisines.length > 2 ? '...' : ''}`
                                : '菜品专家'}
                           </div>
                        </div>
                     </div>
                     <div className="text-lg font-bold">{expert.dishCount} <span className="text-sm font-normal text-gray-500">{lang === Language.ZH ? '道菜' : 'dishes'}</span></div>
                  </div>
                );
              })}
           </div>
         )}
      </div>

      {/* Gourmet Ranking - 按用户统计，堆叠柱状图显示各菜系构成 */}
      <div>
         <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold">{t.gourmet_ranking}</h2>
            <button
              onClick={() => setShowGourmetRanking(true)}
              className="text-xs text-gray-500 font-medium"
            >
              {t.details} &gt;
            </button>
         </div>
         <Card theme={theme} className="h-96 p-4">
            {isLoadingGourmetRanking ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3"></div>
                   <p className="text-sm">
                     {lang === Language.ZH ? '加载中...' : 'Loading...'}
                   </p>
                </div>
              </div>
            ) : gourmetUsers.length === 0 ? (
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
              <div className="h-full flex flex-col">
                 {/* Stacked Bar Chart - 设置最小宽度确保显示5个完整柱状图 */}
                 <div className="flex-1 flex items-end overflow-x-auto overflow-y-hidden" style={{ minWidth: '460px', paddingTop: '16px', paddingBottom: '12px' }}>
                    {/* 所有用户的柱状图容器 */}
                    <div className="flex items-end gap-1" style={{ padding: '0 12px' }}>
                       {(() => {
                          // Use all users for the stacked bar chart (sorted by cuisine count)
                          const allUsers = gourmetUsers;

                          // 找到所有用户所有菜系中的最大菜品数量（用于统一缩放比例）
                          const maxCuisineDishCount = Math.max(
                            ...allUsers.flatMap(u => u.cuisines.map(c => c.dishCount)),
                            1
                          );
                          const maxBarHeight = 160;
                          // 统一的缩放比例，确保相同菜系的用户柱状图高度一致
                          const barScale = maxCuisineDishCount > 0 ? maxBarHeight / maxCuisineDishCount : 0;

                          return allUsers.map((user, userIndex) => (
                            // 每个柱状图固定宽度，不会被压缩或截断
                            <div
                              key={user.userId}
                              className="flex flex-col items-center flex-shrink-0"
                              style={{ width: '78px' }}
                            >
                              {/* Stacked Bar - 每个菜系段高度根据菜品数量按比例调整 */}
                              <div
                                className="flex flex-col-reverse items-center mb-1.5 relative"
                                style={{ minHeight: '32px' }}
                              >
                                {user.cuisines.map((cuisine) => {
                                  // 根据统一的缩放比例计算高度，确保相同菜系的用户柱状图高度一致
                                  const segmentHeight = cuisine.dishCount * barScale;
                                  // 设置最小高度，确保即使菜品数少也能看到
                                  const minSegmentHeight = 4;
                                  const displayHeight = Math.max(segmentHeight, minSegmentHeight);

                                  return (
                                    <div
                                      key={cuisine.cuisineName}
                                      className="w-8 flex items-center justify-center relative group flex-shrink-0"
                                      style={{
                                        height: `${displayHeight}px`,
                                        backgroundColor: cuisine.color,
                                        minHeight: `${minSegmentHeight}px`
                                      }}
                                      title={`${cuisine.cuisineName}: ${cuisine.dishCount} ${lang === Language.ZH ? '道菜' : 'dishes'}`}
                                    >
                                      {/* Show count if segment is large enough */}
                                      {displayHeight > 12 && (
                                        <span className="text-white text-[9px] font-bold drop-shadow-sm">
                                          {cuisine.dishCount}
                                        </span>
                                      )}
                                      {/* Tooltip on hover */}
                                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                                        {cuisine.cuisineName}: {cuisine.dishCount}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* 用户头像 - 使用sm尺寸 */}
                              <UserAvatar
                                src={user.avatarUrl}
                                username={user.username}
                                size="sm"
                                className="mb-0.5"
                              />

                              {/* 用户名 - 强制不换行 */}
                              <div className="text-[10px] text-gray-500 text-center truncate w-full px-0.5" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.username}
                              </div>

                              {/* 总菜系数 - 显示"x 个菜系" */}
                              <div className="text-[9px] text-gray-400 text-center whitespace-nowrap pb-2">
                                {user.cuisineCount} {lang === Language.ZH ? '个菜系' : 'cuisines'}
                              </div>
                            </div>
                          ));
                       })()}
                    </div>
                 </div>

                 {/* Legend - 菜系颜色图例 */}
                 <div className="mt-4 pt-3 border-t border-[var(--border)]">
                    <div className="flex flex-wrap justify-center gap-3">
                       {(() => {
                          // Collect all unique cuisines from all users
                          const allCuisines = new Map<string, string>();
                          gourmetUsers.forEach(user => {
                            user.cuisines.forEach(cuisine => {
                              allCuisines.set(cuisine.cuisineName, cuisine.color);
                            });
                          });

                          // Show up to 12 cuisines in legend
                          const cuisineEntries = Array.from(allCuisines.entries()).slice(0, 12);

                          return cuisineEntries.map(([cuisineName, color]) => (
                            <div key={cuisineName} className="flex items-center gap-1">
                               <div
                                  className="w-3 h-3 rounded-sm"
                                  style={{ backgroundColor: color }}
                               ></div>
                               <span className="text-xs text-gray-500">{cuisineName}</span>
                            </div>
                          ));
                       })()}
                    </div>
                 </div>
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

    {/* All Users Dishes Modal */}
    <AllUsersDishesModal
      isOpen={showAllUsersDishes}
      onClose={() => setShowAllUsersDishes(false)}
      language={lang}
      theme={theme}
    />

    {/* Gourmet Ranking Modal */}
    <GourmetRankingModal
      isOpen={showGourmetRanking}
      onClose={() => setShowGourmetRanking(false)}
      language={lang}
      theme={theme}
    />
  </>
  );
};

export default Tab4Social;