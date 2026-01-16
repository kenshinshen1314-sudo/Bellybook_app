import React, { useState, useMemo } from 'react';
import { NavBar, Card } from '../components/UIComponents';
import { Language, TEXT, Theme } from '../types';
import { ChevronLeft, Share2, UtensilsCrossed, ChevronRight } from 'lucide-react';
import { useMeals } from '@/hooks/useMeals';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from '../hooks/useNavigate';

interface LeaderboardProps {
  title: string;
  type: 'experts' | 'ranking';
  lang: Language;
  theme: Theme;
  onBack: () => void;
  onUserClick: (user: any) => void;
  userId?: string;
}

interface CuisineDetailPageProps {
  cuisine: string;
  displayName: string;
  lang: Language;
  theme: Theme;
  onBack: () => void;
  userId?: string;
}

// Cuisine Detail Page - 显示用户在该菜系下的详情
export const CuisineDetailPage: React.FC<CuisineDetailPageProps> = ({
  cuisine,
  displayName,
  lang,
  theme,
  onBack,
  userId
}) => {
  const t = TEXT[lang];
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const bgClass = theme === 'dark' ? 'bg-[#101010]' : 'bg-[#F2F2F7]';
  const cardBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';

  const { meals } = useMeals(userId);

  // Filter meals by cuisine and group by dish name
  const unlockedDishes = useMemo(() => {
    const dishMap = new Map<string, { meal: any; count: number }>();

    meals
      .filter(m => m.analysis?.cuisine === cuisine)
      .forEach(meal => {
        const dishName = meal.analysis?.foodName;
        if (!dishName) return;

        if (!dishMap.has(dishName)) {
          dishMap.set(dishName, { meal, count: 0 });
        }
        dishMap.get(dishName)!.count++;
      });

    return Array.from(dishMap.values())
      .sort((a, b) => b.count - a.count);
  }, [meals, cuisine]);

  const totalDishes = unlockedDishes.length;

  return (
    <div className={`min-h-screen ${bgClass} pb-safe-bottom animate-slide-left`}>
      <NavBar
        title={cuisine}
        theme={theme}
        leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className={theme === 'dark' ? "text-white" : "text-black"} />}
        onLeftClick={onBack}
        className={theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'}
      />

      <div className="pt-20 px-4 space-y-4">
        {/* User Info Card */}
        <Card theme={theme} className="p-4">
          <div className="flex items-center">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mr-4 text-white text-2xl font-bold flex-shrink-0">
              {displayName?.charAt(0)?.toUpperCase() || '?'}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className={`text-lg font-bold ${textColor} truncate`}>{displayName}</div>
              <div className="text-sm text-gray-500 truncate">{cuisine}</div>
              <div className="text-xs text-gray-400 mt-1">
                {lang === Language.ZH ? '已解锁' : 'Unlocked'} {totalDishes} {lang === Language.ZH ? '道菜肴' : 'dishes'}
              </div>
            </div>
          </div>
        </Card>

        {/* Unlocked Dishes Section */}
        <div>
          <h3 className={`font-bold ${textColor} mb-3 px-1`}>
            {lang === Language.ZH ? '已解锁的菜肴' : 'Unlocked Dishes'}
          </h3>

          {unlockedDishes.length === 0 ? (
            <Card theme={theme} className="p-8 text-center">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm text-gray-500">
                {lang === Language.ZH
                  ? '该菜系暂无解锁的菜肴'
                  : 'No unlocked dishes for this cuisine'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {unlockedDishes.map(({ meal, count }) => (
                <Card
                  key={meal.id}
                  theme={theme}
                  className="aspect-square overflow-hidden p-0"
                >
                  <img
                    src={meal.thumbnailUrl || meal.imageUrl}
                    alt={meal.analysis?.foodName}
                    className="w-full h-2/3 object-cover"
                  />
                  <div className="p-2">
                    <div className={`text-xs font-semibold ${textColor} truncate`}>
                      {meal.analysis?.foodName}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      {lang === Language.ZH ? '品尝' : 'Tasted'} {count} {lang === Language.ZH ? '次' : 'times'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const LeaderboardPage: React.FC<LeaderboardProps> = ({ title, type, lang, theme, onBack, onUserClick, userId }) => {
  const t = TEXT[lang];
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('week');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const bgClass = theme === 'dark' ? 'bg-[#101010]' : 'bg-[#F2F2F7]';
  const itemBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';

  const { meals } = useMeals(userId);
  const { user } = useAuth();
  const displayName = user?.displayName || (user?.username || (lang === 'zh' ? '我' : 'Me'));

  const periods = [
    { key: 'week' as const, label: t.this_week },
    { key: 'month' as const, label: t.this_month },
    { key: 'year' as const, label: t.this_year },
    { key: 'all' as const, label: t.all_time },
  ];

  // Filter meals by time period
  const filteredMeals = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return meals.filter(meal => {
      const mealDate = new Date(meal.createdAt);

      switch (period) {
        case 'week':
          // This week (Monday to Sunday)
          const dayOfWeek = today.getDay();
          const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const monday = new Date(today);
          monday.setDate(today.getDate() - distanceToMonday);
          monday.setHours(0, 0, 0, 0);
          return mealDate >= monday;

        case 'month':
          // This month
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return mealDate >= monthStart;

        case 'year':
          // This year
          const yearStart = new Date(today.getFullYear(), 0, 1);
          return mealDate >= yearStart;

        case 'all':
        default:
          return true;
      }
    });
  }, [meals, period]);

  // Calculate cuisine statistics from filtered meals
  const cuisineStats = useMemo(() => {
    const stats = new Map<string, number>();

    filteredMeals.forEach(meal => {
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
  }, [filteredMeals]);

  // If a cuisine is selected, show cuisine detail page
  if (selectedCuisine) {
    return (
      <CuisineDetailPage
        cuisine={selectedCuisine}
        displayName={displayName}
        lang={lang}
        theme={theme}
        onBack={() => setSelectedCuisine(null)}
        userId={userId}
      />
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} pb-safe-bottom animate-slide-left`}>
      <NavBar
        title={title}
        theme={theme}
        leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className={theme === 'dark' ? "text-white" : "text-black"} />}
        onLeftClick={onBack}
        className={theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'}
      />

      {/* Time Filter Tabs */}
      <div className={`pt-16 px-4 mb-4`}>
        <div className={`flex p-1 rounded-xl ${theme === 'dark' ? 'bg-[#2C2C2E]' : 'bg-gray-200'}`}>
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === p.key
                  ? (theme === 'dark' ? 'bg-[#636366] text-white shadow-sm' : 'bg-white text-black shadow-sm')
                  : 'text-gray-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-3">
        {cuisineStats.length === 0 ? (
          <Card theme={theme} className="p-8 text-center">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-gray-500">
              {lang === Language.ZH
                ? '该时间段暂无记录'
                : 'No records for this period'}
            </p>
          </Card>
        ) : (
          cuisineStats.map((stat, index) => {
            const getBadge = () => {
              if (stat.rank === 1) return '🥇';
              if (stat.rank === 2) return '🥈';
              if (stat.rank === 3) return '🥉';
              return stat.rank.toString();
            };

            return (
              <div
                key={stat.cuisine}
                onClick={() => setSelectedCuisine(stat.cuisine)}
                className={`flex items-center justify-between p-4 rounded-2xl ${itemBg} active:scale-[0.98] transition-transform cursor-pointer`}
              >
                <div className="flex items-center flex-1">
                  <div className={`w-8 text-center text-lg mr-4 ${stat.rank <= 3 ? '' : 'text-gray-400'}`}>
                    {getBadge()}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mr-4 text-white text-sm font-bold">
                    {displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className={`${textColor} font-semibold`}>{displayName}</div>
                    <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full w-fit mt-1">
                      {stat.cuisine}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-3">
                    <div className={`text-lg font-bold`}>{stat.count}</div>
                    <div className="text-[10px] text-gray-400">
                      {lang === Language.ZH ? '道菜' : 'dishes'}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const UserDetailPage: React.FC<{ 
  user: any; 
  lang: Language; 
  theme: Theme; 
  onBack: () => void; 
}> = ({ user, lang, theme, onBack }) => {
  const t = TEXT[lang];
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const subTextColor = 'text-gray-500';
  const bgClass = theme === 'dark' ? 'bg-[#101010]' : 'bg-[#F2F2F7]';
  const cardBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';

  return (
    <div className={`min-h-screen ${bgClass} animate-slide-left pb-safe-bottom`}>
       <NavBar 
        title="" 
        theme={theme} 
        leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className={theme === 'dark' ? "text-white" : "text-black"} />}
        rightIcon={<Share2 size={24} className="text-gray-400" />}
        onLeftClick={onBack}
        className="bg-transparent"
      />
      
      {/* Header Profile */}
      <div className="pt-20 px-6 flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full p-1 border-2 border-yellow-500 mb-4">
          <img src={user?.avatar || 'https://picsum.photos/100/100'} className="w-full h-full rounded-full" alt="profile" />
        </div>
        <h2 className={`text-2xl font-bold ${textColor} mb-1`}>{user?.name || 'User'}</h2>
        <p className={`text-sm ${subTextColor} text-center max-w-[200px]`}>
          {t.bio_mock}
        </p>
        <button className="mt-4 bg-black dark:bg-white text-white dark:text-black px-8 py-2 rounded-full text-sm font-bold">
          {t.follow}
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-around px-8 mb-8">
        <div className="text-center">
          <div className={`text-xl font-bold ${textColor}`}>142</div>
          <div className={`text-xs ${subTextColor}`}>{t.dishes_count}</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${textColor}`}>12</div>
          <div className={`text-xs ${subTextColor}`}>{t.cuisine_count}</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${textColor}`}>5.8k</div>
          <div className={`text-xs ${subTextColor}`}>{t.likes}</div>
        </div>
      </div>

      {/* Gallery / Content */}
      <div className={`rounded-t-3xl ${cardBg} min-h-[500px] p-4`}>
        <h3 className={`font-bold ${textColor} mb-4 px-2`}>{t.recent_collection}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="aspect-square rounded-xl bg-gray-200 overflow-hidden relative">
               <img src={`https://picsum.photos/300/300?food=${i * 10 + user.id}`} className="w-full h-full object-cover" alt="food" />
               <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                 {t.healthy}
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};