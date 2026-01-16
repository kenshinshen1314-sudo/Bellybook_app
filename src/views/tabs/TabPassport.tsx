import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, MapPin, Calendar } from 'lucide-react';
import { Card } from '../../components/UIComponents';
import { useMeals } from '../../hooks/useMeals';
import { Language, Theme } from '../../types';
import { useMinDelay } from '../../hooks/useMinDelay';

interface TabPassportProps {
  lang: Language;
  theme: Theme;
  refreshTrigger?: number;
  onCuisineClick?: (cuisine: string) => void;
  userId?: string;
}

// Cuisine colors for visual variety
const CUISINE_COLORS = [
  'from-orange-400 to-red-500',
  'from-blue-400 to-indigo-500',
  'from-green-400 to-emerald-500',
  'from-purple-400 to-pink-500',
  'from-yellow-400 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-rose-400 to-red-500',
  'from-amber-400 to-yellow-500',
];

// Cuisine icons (emoji fallback)
const CUISINE_ICONS: Record<string, string> = {
  'Chinese': '🥢',
  'Italian': '🍕',
  'Japanese': '🍣',
  'Indian': '🍛',
  'Mexican': '🌮',
  'Thai': '🍜',
  'Korean': '🥘',
  'French': '🥐',
  'American': '🍔',
  'Vietnamese': '🍲',
  'Mediterranean': '🫒',
  'Spanish': '🥘',
  'Greek': '🥙',
  'Turkish': '🧆',
  'Lebanese': '🧆',
  'German': '🥨',
  'British': '🍝',
  'Russian': '🥧',
  'Brazilian': '🥩',
  'Peruvian': '🍽️',
  '川菜': '🌶️',
  '粤菜': '🥟',
  '湘菜': '🌶️',
  '鲁菜': '🍲',
  '苏菜': '🦆',
  '浙菜': '🐟',
  '闽菜': '🦐',
  '皖菜': '🍖',
};

const TabPassport: React.FC<TabPassportProps> = ({ lang, theme, refreshTrigger, onCuisineClick, userId }) => {
  const { meals, isLoading, refresh } = useMeals(userId);
  const { showSkeleton } = useMinDelay(isLoading, 300);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refresh();
    }
  }, [refreshTrigger, refresh]);

  // Group by cuisine and count
  const cuisineData = useMemo(() => {
    const cuisineMap = new Map<string, { count: number; firstMealAt: string; meals: any[] }>();
    meals.forEach(meal => {
      const cuisine = meal.analysis?.cuisine || (lang === Language.ZH ? '未知菜系' : 'Unknown');
      if (!cuisineMap.has(cuisine)) {
        cuisineMap.set(cuisine, {
          count: 0,
          firstMealAt: meal.createdAt,
          meals: []
        });
      }
      const data = cuisineMap.get(cuisine)!;
      data.count++;
      data.meals.push(meal);
      // Track earliest meal
      if (meal.createdAt < data.firstMealAt) {
        data.firstMealAt = meal.createdAt;
      }
    });

    return Array.from(cuisineMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        firstMealAt: data.firstMealAt,
        meals: data.meals,
        color: CUISINE_COLORS[Math.floor(Math.random() * CUISINE_COLORS.length)]
      }))
      .sort((a, b) => b.count - a.count);
  }, [meals, lang]);

  // Stats
  const totalCuisines = cuisineData.length;
  const totalMeals = meals.length;
  const favoriteCuisine = cuisineData.length > 0 ? cuisineData[0] : null;

  const textTitle = theme === 'dark' ? 'text-white/90' : 'text-black/90';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textTertiary = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
  const cardBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';

  // Loading skeleton
  if (showSkeleton) {
    return (
      <div className="pb-28 pt-24 px-4 animate-fade-in">
        <div className="mb-6">
          <div className="h-7 w-32 bg-muted rounded animate-shimmer mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-24 px-4 animate-fade-in">
      {/* Header Stats */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${textTitle}`}>
          {lang === Language.ZH ? '美食护照' : 'Cuisine Passport'}
        </h1>
        <p className={`text-sm ${textSecondary}`}>
          {lang === Language.ZH ? '探索世界美食' : 'Discover world cuisines'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card theme={theme} className={`${cardBg} p-3 text-center`}>
          <div className="text-2xl font-bold text-primary">{totalCuisines}</div>
          <div className={`text-xs ${textTertiary}`}>
            {lang === Language.ZH ? '菜系' : 'Cuisines'}
          </div>
        </Card>
        <Card theme={theme} className={`${cardBg} p-3 text-center`}>
          <div className="text-2xl font-bold text-primary">{totalMeals}</div>
          <div className={`text-xs ${textTertiary}`}>
            {lang === Language.ZH ? '记录' : 'Meals'}
          </div>
        </Card>
        <Card theme={theme} className={`${cardBg} p-3 text-center`}>
          <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
          <div className={`text-xs ${textTertiary}`}>
            {lang === Language.ZH ? '探索中' : 'Exploring'}
          </div>
        </Card>
      </div>

      {/* Favorite Cuisine */}
      {favoriteCuisine && (
        <Card theme={theme} className={`${cardBg} p-4 mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs ${textTertiary} mb-1`}>
                {lang === Language.ZH ? '最爱菜系' : 'Favorite Cuisine'}
              </div>
              <div className={`text-lg font-bold ${textTitle}`}>
                {favoriteCuisine.name}
              </div>
              <div className={`text-xs ${textSecondary}`}>
                {favoriteCuisine.count} {lang === Language.ZH ? '餐' : 'meals'}
              </div>
            </div>
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${favoriteCuisine.color} flex items-center justify-center text-3xl`}>
              {CUISINE_ICONS[favoriteCuisine.name] || '🍽️'}
            </div>
          </div>
        </Card>
      )}

      {/* Cuisine Grid */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
          {lang === Language.ZH ? '我的菜系' : 'My Cuisines'}
        </h2>

        {cuisineData.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {cuisineData.map((cuisine, index) => (
              <motion.div
                key={cuisine.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  theme={theme}
                  className={`${cardBg} p-4 cursor-pointer transition-transform hover:scale-105`}
                  onClick={() => {
                    console.log('TabPassport: Clicked cuisine', cuisine.name);
                    onCuisineClick?.(cuisine.name);
                  }}
                >
                  {/* Cuisine Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cuisine.color} flex items-center justify-center text-2xl mb-3`}>
                    {CUISINE_ICONS[cuisine.name] || '🍽️'}
                  </div>

                  {/* Cuisine Name */}
                  <h3 className={`font-bold ${textTitle} truncate mb-1`}>
                    {cuisine.name}
                  </h3>

                  {/* Stats */}
                  <div className={`text-xs ${textSecondary} flex items-center space-x-2`}>
                    <span>{cuisine.count} {lang === Language.ZH ? '餐' : 'meals'}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card theme={theme} className={`${cardBg} border-2 border-dashed ${theme === 'dark' ? 'border-white/10' : 'border-black/10'} h-48 flex flex-col items-center justify-center p-8 text-center`}>
            <MapPin className={`w-12 h-12 mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`font-medium mb-2 ${textSecondary}`}>
              {lang === Language.ZH ? '开始你的美食之旅' : 'Start Your Culinary Journey'}
            </h3>
            <p className={`text-xs ${textTertiary}`}>
              {lang === Language.ZH
                ? '记录第一餐，解锁你的第一个菜系印章'
                : 'Record your first meal to unlock your first cuisine stamp'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TabPassport;
