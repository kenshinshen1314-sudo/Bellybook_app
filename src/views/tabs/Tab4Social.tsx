import React, { useMemo } from 'react';
import { Card } from '../../components/UIComponents';
import { Language, TEXT, Theme } from '../../types';
import { useCuisineMasters } from '@/hooks/useCuisineMasters';
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
  // Fetch cuisine masters from backend API
  const { masters, isLoading } = useCuisineMasters(undefined, lang);
  const { user } = useAuth();

  // Get display name
  const displayName = user?.displayName || (user?.username || (lang === 'zh' ? '我' : 'Me'));

  return (
    <div className={`pb-28 pt-24 px-4 animate-fade-in ${textColor} space-y-8`}>
      {/* Cuisine Experts - 按用户统计菜品数量，倒序展示 */}
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

         {masters.length === 0 ? (
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
              {masters.slice(0, 5).map((master) => {
                // Badge for top 3
                const getBadge = () => {
                  if (master.rank === 1) return '🥇';
                  if (master.rank === 2) return '🥈';
                  if (master.rank === 3) return '🥉';
                  return master.rank.toString();
                };

                // Get avatar or use first letter of username
                const avatarContent = master.avatarUrl
                  ? <img src={master.avatarUrl} alt={master.username} className="w-full h-full rounded-full object-cover" />
                  : <span>{master.username?.charAt(0)?.toUpperCase() || '?'}</span>;

                return (
                  <div key={`${master.userId}-${master.cuisineName}`} className="flex items-center justify-between p-3">
                     <div className="flex items-center flex-1">
                        <div className={`w-8 text-center text-lg mr-3 ${master.rank <= 3 ? '' : 'text-gray-500'}`}>
                           {getBadge()}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mr-3 text-white text-sm font-bold overflow-hidden">
                           {avatarContent}
                        </div>
                        <div className="flex-1">
                           <div className="font-semibold text-sm">{master.username}</div>
                           <div className="text-xs text-gray-500">
                              {master.cuisineName}
                           </div>
                        </div>
                     </div>
                     <div className="text-lg font-bold">{master.mealCount} <span className="text-sm font-normal text-gray-500">{lang === Language.ZH ? '道菜' : 'dishes'}</span></div>
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
            <button
              onClick={onRankingClick}
              className="text-xs text-gray-500 font-medium"
            >
              {t.details} &gt;
            </button>
         </div>
         <Card theme={theme} className="h-80 p-4">
            {masters.length === 0 ? (
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
                    // Get top 5 masters for the bar chart
                    const topMasters = masters.slice(0, 5);
                    const maxMealCount = Math.max(...topMasters.map(m => m.mealCount), 1);
                    const maxBarHeight = 200;
                    const barScale = maxMealCount > 0 ? maxBarHeight / maxMealCount : 0;

                    return topMasters.map((master) => {
                      const barHeight = master.mealCount * barScale;
                      const avatarContent = master.avatarUrl
                        ? <img src={master.avatarUrl} alt={master.username} className="w-full h-full rounded-full object-cover" />
                        : <span>{master.username?.charAt(0)?.toUpperCase() || '?'}</span>;

                      return (
                        <div key={`${master.userId}-${master.cuisineName}`} className="flex flex-col items-center mx-4">
                           {/* 柱状图 */}
                           <div
                              className="w-16 rounded-t-sm bg-gradient-to-t from-amber-400 to-amber-500 flex items-end justify-center mb-2 relative"
                              style={{ height: `${Math.max(barHeight, 20)}px`, minHeight: '20px' }}
                           >
                              {barHeight > 20 && (
                                <div className="text-white text-sm font-bold mb-1 drop-shadow-sm">
                                   {master.mealCount}
                                </div>
                              )}
                           </div>

                           {/* 用户头像 */}
                           <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mb-1 overflow-hidden"
                              style={{
                                background: 'linear-gradient(135deg, rgb(251 191 36) 0%, rgb(245 158 11) 100%)',
                                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
                              }}
                           >
                              {avatarContent}
                           </div>

                           {/* 用户名 */}
                           <div className="text-xs text-gray-500 mt-1 text-center max-w-[80px] truncate">
                              {master.username}
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