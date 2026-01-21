import React, { useState, useMemo } from 'react';
import { NavBar } from '../components/UIComponents';
import { Language, TEXT, Theme } from '../types';
import { ChevronLeft, Share2, UtensilsCrossed, ChevronRight, ArrowLeft } from 'lucide-react';
import { useMeals } from '@/hooks/useMeals';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

  const coverImage = unlockedDishes.length > 0 && (unlockedDishes[0].meal.thumbnailUrl || unlockedDishes[0].meal.imageUrl)
    ? (unlockedDishes[0].meal.thumbnailUrl || unlockedDishes[0].meal.imageUrl)
    : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className={cn(
      "min-h-screen bg-background pb-safe-bottom animate-slide-left"
    )}>
      {/* Hero Header Section */}
      <div className="relative h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src={coverImage}
          className="w-full h-full object-cover blur-sm scale-110"
          alt={cuisine}
        />

        {/* Navigation */}
        <button
          onClick={onBack}
          className="absolute top-safe-top left-4 z-20 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 pb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                )}
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 100%)',
                  boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
                }}>
                  {displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-white/80">{cuisine}</div>
                  <h1 className="text-xl font-bold text-white truncate">{displayName}</h1>
                </div>
              </div>

              <div className="flex space-x-6">
                <div>
                  <div className="text-lg font-bold text-white">{totalDishes}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/70">DISHES</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {meals.filter(m => m.analysis?.cuisine === cuisine).length}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-white/70">TASTES</div>
                </div>
              </div>
            </div>

            {/* Circular Image Thumbnail (Latest) */}
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden -mb-12 flex-shrink-0">
              <img
                src={coverImage}
                className="w-full h-full object-cover"
                alt="Latest"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 px-4 space-y-4">
        {/* Unlocked Dishes Section */}
        <div>
          <h3 className={cn("font-bold text-foreground mb-3 px-1")}>
            {lang === Language.ZH ? '已解锁的菜肴' : 'Unlocked Dishes'}
          </h3>

          {unlockedDishes.length === 0 ? (
            <Card variant="inset" className="p-8 text-center">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className={cn("text-sm text-muted-foreground")}>
                {lang === Language.ZH
                  ? '该菜系暂无解锁的菜肴'
                  : 'No unlocked dishes for this cuisine'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {unlockedDishes.map(({ meal, count }, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                >
                  <Card variant="raised" className="aspect-square overflow-hidden p-0">
                    <img
                      src={meal.thumbnailUrl || meal.imageUrl}
                      alt={meal.analysis?.foodName}
                      className="w-full h-2/3 object-cover"
                    />
                    <div className="p-2">
                      <div className={cn("text-xs font-semibold text-foreground truncate")}>
                        {meal.analysis?.foodName}
                      </div>
                      <div className={cn("text-[10px] text-muted-foreground mt-1")}>
                        {lang === Language.ZH ? '品尝' : 'Tasted'} {count} {lang === Language.ZH ? '次' : 'times'}
                      </div>
                    </div>
                  </Card>
                </motion.div>
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
          const dayOfWeek = today.getDay();
          const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const monday = new Date(today);
          monday.setDate(today.getDate() - distanceToMonday);
          monday.setHours(0, 0, 0, 0);
          return mealDate >= monday;

        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return mealDate >= monthStart;

        case 'year':
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
    <div className={cn("min-h-screen bg-background pb-safe-bottom animate-slide-left")}>
      <NavBar
        title={title}
        theme={theme}
        leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className="text-foreground" />}
        onLeftClick={onBack}
        className={cn("bg-card border-b border-border")}
      />

      {/* Time Filter Tabs */}
      <div className="pt-16 px-4 mb-4">
        <Card variant="inset" className="flex p-1">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "flex-1 py-2 text-xs font-medium rounded-xl transition-all",
                "hover:scale-[1.02] active:scale-[0.98]",
                period === p.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </Card>
      </div>

      {/* List */}
      <div className="px-4 space-y-3">
        {cuisineStats.length === 0 ? (
          <Card variant="inset" className="p-8 text-center">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
            <p className={cn("text-sm text-muted-foreground")}>
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
              <motion.div
                key={stat.cuisine}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.03 }}
              >
                <Card
                  variant="raised"
                  onClick={() => setSelectedCuisine(stat.cuisine)}
                  className="flex items-center justify-between p-4 cursor-pointer"
                >
                  <div className="flex items-center flex-1">
                    <div className={cn(
                      "w-8 text-center text-lg mr-4",
                      stat.rank <= 3 ? "" : "text-muted-foreground"
                    )}>
                      {getBadge()}
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mr-4 text-white text-lg font-bold"
                    )}
                    style={{
                      background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 100%)',
                      boxShadow: '0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
                    }}>
                      {displayName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className={cn("text-foreground font-semibold")}>{displayName}</div>
                      <div className={cn(
                        "text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit mt-1"
                      )}>
                        {stat.cuisine}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <div className={cn("text-lg font-bold text-foreground")}>{stat.count}</div>
                      <div className={cn("text-[10px] text-muted-foreground")}>
                        {lang === Language.ZH ? '道菜' : 'dishes'}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-muted-foreground" />
                  </div>
                </Card>
              </motion.div>
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

  return (
    <div className={cn("min-h-screen bg-background animate-slide-left pb-safe-bottom")}>
      <NavBar
        title=""
        theme={theme}
        leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className="text-foreground" />}
        rightIcon={<Share2 size={24} className="text-muted-foreground" />}
        onLeftClick={onBack}
        className="bg-transparent"
      />

      {/* Header Profile */}
      <div className="pt-20 px-6 flex flex-col items-center mb-8">
        <div className={cn(
          "w-24 h-24 rounded-full p-1 border-2 border-primary mb-4",
          "shadow-[0_4px_16px_color-mix(in_srgb,var(--primary)_30%,_transparent)]"
        )}>
          <img src={user?.avatar || 'https://picsum.photos/100/100'} className="w-full h-full rounded-full" alt="profile" />
        </div>
        <h2 className={cn("text-2xl font-bold text-foreground mb-1")}>{user?.name || 'User'}</h2>
        <p className={cn("text-sm text-muted-foreground text-center max-w-[200px]")}>
          {t.bio_mock}
        </p>
        <button className={cn(
          "mt-4 bg-primary text-primary-foreground px-8 py-2 rounded-full text-sm font-bold",
          "hover:scale-[1.02] active:scale-[0.98] transition-transform",
          "shadow-[0_4px_12px_color-mix(in_srgb,var(--primary)_35%,_transparent),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.1)]"
        )}>
          {t.follow}
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-around px-8 mb-8">
        <div className="text-center">
          <div className={cn("text-xl font-bold text-foreground")}>142</div>
          <div className={cn("text-xs text-muted-foreground")}>{t.dishes_count}</div>
        </div>
        <div className="text-center">
          <div className={cn("text-xl font-bold text-foreground")}>12</div>
          <div className={cn("text-xs text-muted-foreground")}>{t.cuisine_count}</div>
        </div>
        <div className="text-center">
          <div className={cn("text-xl font-bold text-foreground")}>5.8k</div>
          <div className={cn("text-xs text-muted-foreground")}>{t.likes}</div>
        </div>
      </div>

      {/* Gallery / Content */}
      <Card className="rounded-t-3xl min-h-[500px] p-4" variant="raised">
        <h3 className={cn("font-bold text-foreground mb-4 px-2")}>{t.recent_collection}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i, index) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.05 }}
              className="aspect-square rounded-2xl overflow-hidden relative bg-muted"
            >
              <img src={`https://picsum.photos/300/300?food=${i * 10 + user.id}`} className="w-full h-full object-cover" alt="food" />
              <div className={cn(
                "absolute bottom-2 right-2 bg-background/80 text-foreground text-[10px] px-2 py-0.5 rounded-full",
                "backdrop-blur-sm"
              )}>
                {t.healthy}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};
