import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Language, Theme, TEXT } from '../../types';
import { MealDetailModal } from '../../components/MealDetailModal';
import { useDishDetail } from '../../hooks/useDishDetail';

interface DishDetailProps {
  dishName: string;
  lang: Language;
  theme: Theme;
  onBack: () => void;
}

export const DishDetail: React.FC<DishDetailProps> = ({
  dishName,
  lang,
  theme,
  onBack,
}) => {
  const t = TEXT[lang];
  const isDark = theme === 'dark';

  // Fetch dish details from backend API
  const { meals, dish, isLoading, error } = useDishDetail(dishName, lang);

  // State for Meal Detail Modal
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  // Loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-gray-50'} flex items-center justify-center p-6`}>
        <div className={`text-center ${isDark ? 'text-white' : 'text-black'}`}>
          <p className="mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-primary text-white"
          >
            {lang === Language.ZH ? '返回' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  // No data found
  if (!dish || meals.length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-gray-50'} flex items-center justify-center p-6`}>
        <div className={`text-center ${isDark ? 'text-white' : 'text-black'}`}>
          <p className="mb-4">
            {lang === Language.ZH ? '未找到菜品记录' : 'No dish records found'}
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-primary text-white"
          >
            {lang === Language.ZH ? '返回' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  // Use latest meal image for display
  const latestMeal = meals[0];
  const imageUrl = latestMeal.thumbnailUrl || latestMeal.imageUrl;

  // ============================================================
  // 营养数据格式化 - 确保显示整数
  // ============================================================
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return String(Math.round(num));
  };

  // Nutrition info from dish (averages) or latest meal
  const calories = formatNumber(dish.averageCalories ?? latestMeal.analysis?.nutrition?.calories);
  const protein = formatNumber(dish.averageProtein ?? latestMeal.analysis?.nutrition?.protein);
  const fat = formatNumber(dish.averageFat ?? latestMeal.analysis?.nutrition?.fat);
  const carbs = formatNumber(dish.averageCarbs ?? latestMeal.analysis?.nutrition?.carbohydrates);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-gray-50'} animate-slide-left relative`}>
      <div className="pt-6 px-4 pb-10 space-y-6">
        {/* Main Card */}
        <Card className={`p-6 border-none shadow-sm ${isDark ? 'bg-[#1C1C1E] text-white' : 'bg-white'}`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              {/* Food Icon/Image small */}
              <div className="w-12 h-12 rounded-full overflow-hidden mb-3">
                <img src={imageUrl} className="w-full h-full object-cover" alt="icon" />
              </div>
              <h1 className="text-2xl font-serif font-bold mb-1">{dish.name}</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {dish.cuisine}
              </p>
            </div>
          </div>

          <div className="flex items-baseline space-x-8 mb-6">
            <div>
              <div className="text-2xl font-bold">{dish.appearanceCount}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {lang === Language.ZH ? '已品尝' : 'Tasted'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{calories}</div>
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>kcal</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div>
                {t.macro_protein}
              </div>
              <div className="text-lg font-medium">{protein}g</div>
            </div>
            <div>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></div>
                {t.macro_fat}
              </div>
              <div className="text-lg font-medium">{fat}g</div>
            </div>
            <div>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div>
                {t.macro_carbs}
              </div>
              <div className="text-lg font-medium">{carbs}g</div>
            </div>
          </div>
        </Card>

        {/* History Section */}
        <div>
          <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.history_source}
          </h3>
          <Card className={`p-4 border-none shadow-sm ${isDark ? 'bg-card text-card-foreground' : 'bg-card text-muted-foreground'}`}>
            <p className="text-sm leading-relaxed">
              {dish.historicalOrigins || dish.description ||
                (lang === Language.ZH ? '暂无历史渊源记录' : 'No historical information available')}
            </p>
          </Card>
        </div>

        {/* Description Section (if available) */}
        {dish.description && (
          <div>
            <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {lang === Language.ZH ? '菜品介绍' : 'Description'}
            </h3>
            <Card className={`p-4 border-none shadow-sm ${isDark ? 'bg-card text-card-foreground' : 'bg-card text-muted-foreground'}`}>
              <p className="text-sm leading-relaxed">{dish.description}</p>
            </Card>
          </div>
        )}

        {/* Tasting Records */}
        <div>
          <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.tasting_records}
          </h3>
          <div className="space-y-3">
            {meals.map((meal) => {
              const date = new Date(meal.createdAt);
              const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
              const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

              return (
                <motion.div
                  key={meal.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMeal(meal)}
                >
                  <Card className={`p-3 flex items-center space-x-3 border-none shadow-sm ${isDark ? 'bg-card' : 'bg-card'}`}>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img src={meal.thumbnailUrl || meal.imageUrl} className="w-full h-full object-cover" alt="meal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {meal.analysis?.poeticDescription || meal.analysis?.dishes?.[0]?.foodName || meal.analysis?.foodName || (lang === Language.ZH ? '无标题' : 'No Title')}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {lang === Language.ZH ? `共 ${meal.analysis?.ingredients?.length || 0} 种食物` : `${meal.analysis?.ingredients?.length || 0} Ingredients`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{dateStr}</div>
                      <div className="text-xs text-gray-500">{timeStr}</div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          isOpen={!!selectedMeal}
          onClose={() => setSelectedMeal(null)}
          lang={lang}
          theme={theme}
        />
      )}

      {/* Bottom Left Back Button */}
      <button
        onClick={onBack}
        className={`fixed bottom-6 left-6 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${
          isDark
            ? 'bg-white/20 backdrop-blur-md text-white'
            : 'bg-card shadow-md text-card-foreground'
        }`}
      >
        <ArrowLeft size={24} />
      </button>
    </div>
  );
};
