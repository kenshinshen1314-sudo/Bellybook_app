import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Language, Theme, TEXT } from '../../types';
import { AnalysisResult } from '../../types';
import { useCuisineMeals } from '../../hooks/useCuisineMeals';

interface CuisineDetailProps {
  cuisine: string;
  lang: Language;
  theme: Theme;
  onBack: () => void;
  onDishClick: (dishName: string) => void;
}

export const CuisineDetail: React.FC<CuisineDetailProps> = ({
  cuisine,
  lang,
  theme,
  onBack,
  onDishClick
}) => {
  const t = TEXT[lang];
  const isDark = theme === 'dark';

  // Fetch meals by cuisine from backend API
  const { meals, isLoading, total, hasMore, loadMore } = useCuisineMeals(cuisine, lang, 50);

  // Aggregate stats
  const stats = useMemo(() => {
    // Unique dishes (by foodName)
    const uniqueDishes = new Set(meals.map(m => m.analysis?.foodName).filter(Boolean));
    return {
      unlocked: uniqueDishes.size,
      tastes: meals.length,
      dishes: uniqueDishes.size
    };
  }, [meals]);

  // Group by dish for the list
  const dishList = useMemo(() => {
    const dishMap = new Map<string, { latest: any, count: number }>();
    meals.forEach(meal => {
      const name = meal.analysis?.foodName;
      if (!name) return;
      if (!dishMap.has(name)) {
        dishMap.set(name, { latest: meal, count: 0 });
      }
      const data = dishMap.get(name)!;
      data.count++;
      if (meal.createdAt > data.latest.createdAt) {
        data.latest = meal;
      }
    });
    return Array.from(dishMap.values()).sort((a, b) =>
      new Date(b.latest.createdAt).getTime() - new Date(a.latest.createdAt).getTime()
    );
  }, [meals]);

  // Get a cover image (use the latest meal's image)
  const coverImage = meals.length > 0 && (meals[0].thumbnailUrl || meals[0].imageUrl)
    ? (meals[0].thumbnailUrl || meals[0].imageUrl)
    : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-black'} animate-fade-in`}>
      {/* Header Image Section */}
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
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-white/80 mb-2">CUISINE</div>
              <h1 className="text-3xl font-bold text-white mb-4">{cuisine}</h1>

              <div className="flex space-x-8">
                <div>
                  <div className="text-xl font-bold text-white">{stats.unlocked}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/70">UNLOCKED</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{total || stats.tastes}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/70">TASTES</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.dishes}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/70">DISHES</div>
                </div>
              </div>
            </div>

            {/* Circular Image Thumbnail (Latest) */}
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden -mb-16">
              <img
                src={coverImage}
                className="w-full h-full object-cover"
                alt="Latest"
              />
            </div>
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="px-4 pt-16 pb-10 space-y-4">
        <h2 className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {lang === Language.ZH ? '已解锁菜肴' : 'Unlocked Dishes'}
        </h2>

        {/* Loading State */}
        {isLoading && meals.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>
              {lang === Language.ZH ? '暂无菜品记录' : 'No dishes recorded'}
            </p>
          </div>
        ) : (
          <>
            {dishList.map((item) => {
              const meal = item.latest;
              const analysis = meal.analysis as AnalysisResult;
              const date = new Date(meal.createdAt).toLocaleDateString(lang === Language.ZH ? 'zh-CN' : 'en-US');
              // Get food name from dishes array (new format) or fallback to foodName (old format)
              const foodName = analysis.dishes?.[0]?.foodName || analysis.foodName || 'Unknown';

              return (
                <motion.div
                  key={meal.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDishClick(foodName)}
                >
                  <Card className={`p-3 flex items-center space-x-4 border-none shadow-sm ${isDark ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                      <img src={meal.thumbnailUrl || meal.imageUrl} className="w-full h-full object-cover" alt={foodName} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{foodName}</h3>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {t.tasted_times} {item.count} {t.times} · {date}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Card>
                </motion.div>
              );
            })}

            {/* Load More Button */}
            {hasMore && (
              <div className="pt-4">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-black/5 hover:bg-black/10 text-black'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {lang === Language.ZH ? '加载中...' : 'Loading...'}
                    </span>
                  ) : (
                    lang === Language.ZH ? '加载更多' : 'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Left Back Button */}
      <button
        onClick={onBack}
        className={`fixed bottom-6 left-6 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${
          isDark
            ? 'bg-white/20 backdrop-blur-md text-white'
            : 'bg-white shadow-md text-black'
        }`}
      >
        <ArrowLeft size={24} />
      </button>
    </div>
  );
};
