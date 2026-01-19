import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';
import { Card } from '../../components/UIComponents';
import { MealDetailModal } from '../../components/MealDetailModal';
import { useBackendMeals } from '../../hooks/useBackendMeals';
import { Language, Theme, TEXT } from '../../types';
import { useMinDelay } from '../../hooks/useMinDelay';
import { SkeletonMealItem } from '../../components/ui/skeleton';
import { useToastNotification } from '@/contexts/ToastContext';
import type { MealResponse } from '@/api/types';

interface Tab1HomeProps {
  lang: Language;
  theme: Theme;
  refreshTrigger?: number;
  userId?: string;
}

// Garnish ingredients to filter out
const GARNISH_INGREDIENTS = ['葱花', '香菜', '辣椒', '花椒', '芝麻', '葱', '蒜', '姜', '小葱'];

// Default ingredient icons mapping
const INGREDIENT_ICONS: Record<string, string> = {
  '红薯': '🍠',
  '红薯块': '🍠',
  '香肠': '🌭',
  '肉条': '🥓',
  '猪肉': '🥩',
  '牛肉': '🥩',
  '鸡肉': '🍗',
  '鱼': '🐟',
  '虾': '🦐',
  '蛋': '🥚',
  '鸡蛋': '🥚',
  '米饭': '🍚',
  '面条': '🍜',
  '蔬菜': '🥬',
  '白菜': '🥬',
  '番茄': '🍅',
  '土豆': '🥔',
  '胡萝卜': '🥕',
  '豆腐': '🧈',
  '面包': '🍞',
  '奶酪': '🧀',
  '水果': '🍎',
};

// Get icon for ingredient
function getIngredientIcon(name: string): string {
  // Try exact match first
  if (INGREDIENT_ICONS[name]) return INGREDIENT_ICONS[name];
  // Try partial match
  for (const [key, icon] of Object.entries(INGREDIENT_ICONS)) {
    if (name.includes(key) || key.includes(name)) return icon;
  }
  return '🍽️'; // Default food icon
}

// Get ingredient description based on name
function getIngredientDescription(name: string, lang: Language): string {
  const descriptions: Record<string, { zh: string; en: string }> = {
    '红薯块': { zh: '红薯原产于美洲，明代传入中国后迅速普及，成为重要的粮食作物...', en: 'Sweet potato originated from Americas, introduced to China in Ming Dynasty...' },
    '红薯': { zh: '红薯原产于美洲，明代传入中国后迅速普及，成为重要的粮食作物...', en: 'Sweet potato originated from Americas...' },
    '香肠': { zh: '香肠在德国有悠久历史，可追溯至古罗马时期。德国香肠种类繁多...', en: 'Sausages have a long history in Germany, dating back to ancient Rome...' },
    '肉条': { zh: '肉条源于美洲，作为便携的高蛋白食品，是传统保存肉类的方式...', en: 'Meat strips originated from Americas as portable high-protein food...' },
    '猪肉': { zh: '猪肉是世界上消费量最大的肉类之一，富含优质蛋白质和B族维生素...', en: 'Pork is one of the most consumed meats worldwide, rich in protein...' },
    '牛肉': { zh: '牛肉含有丰富的蛋白质和铁质，是优质的红肉来源...', en: 'Beef is rich in protein and iron, an excellent red meat source...' },
    '鸡肉': { zh: '鸡肉是低脂高蛋白的优质肉类，易于消化吸收...', en: 'Chicken is a lean, high-protein meat that is easy to digest...' },
  };

  const desc = descriptions[name];
  if (desc) return lang === Language.ZH ? desc.zh : desc.en;
  return lang === Language.ZH ? `${name}是常见的食材...` : `${name} is a common ingredient...`;
}

// Cuisine tag mapping
function getCuisineTag(cuisine: string | undefined, lang: Language): string {
  if (!cuisine) return lang === Language.ZH ? '家常菜' : 'Home Cooking';
  const cuisineMap: Record<string, { zh: string; en: string }> = {
    '中餐': { zh: '中餐', en: 'Chinese' },
    '粤菜': { zh: '粤菜', en: 'Cantonese' },
    '川菜': { zh: '川菜', en: 'Sichuan' },
    '日料': { zh: '日料', en: 'Japanese' },
    '韩餐': { zh: '韩餐', en: 'Korean' },
    '西餐': { zh: '西餐', en: 'Western' },
    '意大利菜': { zh: '意大利菜', en: 'Italian' },
    '德国菜': { zh: '德国菜', en: 'German' },
    '法餐': { zh: '法餐', en: 'French' },
    '美国菜': { zh: '美国菜', en: 'American' },
  };

  for (const [key, value] of Object.entries(cuisineMap)) {
    if (cuisine.includes(key)) return lang === Language.ZH ? value.zh : value.en;
  }
  return cuisine;
}

/**
 * Ingredient Card for "近期解锁" section
 */
function IngredientCard({
  name,
  description,
  icon,
  theme,
  index
}: {
  name: string;
  description: string;
  icon: string;
  theme: Theme;
  index: number;
}) {
  const cardBg = theme === 'dark' ? 'bg-[#2C2C2E]' : 'bg-white border border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const descColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`${cardBg} rounded-2xl p-4 min-w-[140px] max-w-[160px]`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-bold ${textColor} px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-white/70'}`}>
          {name}
        </span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-xs ${descColor} line-clamp-2 leading-relaxed`}>
        {description}
      </p>
    </motion.div>
  );
}

/**
 * Nutrition Card Component - Same size as meal image for fan effect
 */
function NutritionFanCard({
  nutrition,
  lang,
  theme,
  isOnTop,
  onClick
}: {
  nutrition: { calories: number; protein: number; fat: number; carbohydrates: number };
  lang: Language;
  theme: Theme;
  isOnTop: boolean;
  onClick: () => void;
}) {
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-600' : 'border-gray-300';
  const bgColor = theme === 'dark' ? 'bg-[#2C2C2E]' : 'bg-white';

  return (
    <motion.div
      className={`absolute ${bgColor} rounded-2xl p-3 cursor-pointer border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
      style={{
        width: 150,
        height: 180,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        transformOrigin: 'center center',
      }}
      animate={{
        rotate: isOnTop ? 0 : -15,
        x: isOnTop ? 0 : -15,
        zIndex: isOnTop ? 20 : 10,
        scale: isOnTop ? 1 : 0.95
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
    >
      <div className={`text-xs font-bold ${textColor} mb-1 border-b ${borderColor} pb-1`}>
        {lang === Language.ZH ? '胃之书营养卡片' : 'Bellybook Nutrition'}
      </div>
      <div className={`text-[10px] ${subTextColor} mb-2`}>
        {lang === Language.ZH ? '本餐营养学分析' : 'Meal Nutrition Analysis'}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className={`text-xs font-medium ${textColor}`}>
            {lang === Language.ZH ? '卡路里' : 'Calories'}
          </span>
          <span className={`text-sm font-bold ${textColor}`}>
            {Math.round(nutrition.calories)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-[10px] ${subTextColor}`}>
            {lang === Language.ZH ? '脂肪' : 'Fat'}
          </span>
          <span className={`text-xs font-medium ${textColor}`}>
            {nutrition.fat.toFixed(1)}g
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-[10px] ${subTextColor}`}>
            {lang === Language.ZH ? '蛋白质' : 'Protein'}
          </span>
          <span className={`text-xs font-medium ${textColor}`}>
            {Math.round(nutrition.protein)}g
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-[10px] ${subTextColor}`}>
            {lang === Language.ZH ? '碳水' : 'Carbs'}
          </span>
          <span className={`text-xs font-medium ${textColor}`}>
            {Math.round(nutrition.carbohydrates)}g
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Meal Image Card - Same size as nutrition card for fan effect
 */
function MealImageFanCard({
  imageUrl,
  foodName,
  isOnTop,
  onClick
}: {
  imageUrl: string;
  foodName: string;
  isOnTop: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="absolute rounded-2xl overflow-hidden cursor-pointer"
      style={{
        width: 150,
        height: 180,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        transformOrigin: 'center center',
      }}
      animate={{
        rotate: isOnTop ? 0 : 12,
        x: isOnTop ? 0 : 15,
        zIndex: isOnTop ? 20 : 10,
        scale: isOnTop ? 1 : 0.95
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
    >
      <img
        src={imageUrl}
        alt={foodName}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}

/**
 * Fan Card Stack - Container for the fan effect between image and nutrition
 */
function FanCardStack({
  meal,
  lang,
  theme
}: {
  meal: MealResponse;
  lang: Language;
  theme: Theme;
}) {
  const [showNutrition, setShowNutrition] = React.useState(false);

  return (
    <div
      className="relative"
      style={{ width: 200, height: 200 }}
    >
      {/* Nutrition Card - behind by default, comes forward on click */}
      {meal.analysis.nutrition && (
        <NutritionFanCard
          nutrition={meal.analysis.nutrition}
          lang={lang}
          theme={theme}
          isOnTop={showNutrition}
          onClick={() => setShowNutrition(true)}
        />
      )}

      {/* Meal Image - on top by default, goes behind on nutrition click */}
      <MealImageFanCard
        imageUrl={meal.thumbnailUrl || meal.imageUrl}
        foodName={meal.analysis.foodName}
        isOnTop={!showNutrition}
        onClick={() => setShowNutrition(false)}
      />
    </div>
  );
}

/**
 * Meal Card with Image and Nutrition Fan Effect
 */
function MealCard({
  meal,
  lang,
  theme,
  index,
  onClick
}: {
  meal: MealResponse;
  lang: Language;
  theme: Theme;
  index: number;
  onClick?: () => void;
}) {
  const date = new Date(meal.createdAt);
  const day = date.getDate();

  const textTitle = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';
  const tagBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';

  // Filter out garnishes from ingredients
  // Backend returns ingredients as string[], frontend may expect object array
  const rawIngredients = meal.analysis?.ingredients || [];
  const mainIngredients = rawIngredients
    .map(ing => typeof ing === 'string' ? { name: ing } : ing)
    .filter(ing => ing && ing.name && typeof ing.name === 'string' && !GARNISH_INGREDIENTS.some(g => ing.name.includes(g)))
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-6"
    >
      {/* Date indicator and Fan Cards */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`text-2xl font-bold ${textTitle} min-w-[48px]`}>
          {day}<span className={`text-sm ${textSecondary} ml-0.5`}>|</span>
        </div>

        {/* Fan Card Stack - Image and Nutrition toggle */}
        <div className="flex-1 flex justify-center">
          <FanCardStack
            meal={meal}
            lang={lang}
            theme={theme}
          />
        </div>
      </div>

      {/* Ingredient list - Sticky Note Style */}
      <div className="space-y-3">
        {mainIngredients.map((ingredient, idx) => {
          // Sticky note colors - warm paper tones
          const stickyColors = [
            { bg: 'bg-[#FFF9C4]', shadow: 'shadow-[#E6DFA0]' }, // Yellow
            { bg: 'bg-[#FFCCBC]', shadow: 'shadow-[#E6B3A3]' }, // Peach
            { bg: 'bg-[#C8E6C9]', shadow: 'shadow-[#A8C9A9]' }, // Mint
            { bg: 'bg-[#B3E5FC]', shadow: 'shadow-[#8CC8E0]' }, // Sky blue
          ];
          const darkStickyColors = [
            { bg: 'bg-[#4A4522]', shadow: 'shadow-[#3A3818]' },
            { bg: 'bg-[#4A3530]', shadow: 'shadow-[#3A2820]' },
            { bg: 'bg-[#2A4A2C]', shadow: 'shadow-[#1A3A1C]' },
            { bg: 'bg-[#1A3A4A]', shadow: 'shadow-[#0A2A3A]' },
          ];
          const colors = theme === 'dark' ? darkStickyColors : stickyColors;
          const stickyStyle = colors[idx % colors.length];
          const rotation = idx % 2 === 0 ? 'rotate-1' : '-rotate-1';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, rotate: -5 }}
              animate={{ opacity: 1, rotate: idx % 2 === 0 ? 1 : -1 }}
              transition={{ delay: idx * 0.05 }}
              className={`${stickyStyle.bg} p-4 relative ${rotation} cursor-pointer hover:scale-[1.02] transition-transform`}
              style={{
                borderRadius: '2px',
                boxShadow: theme === 'dark'
                  ? '2px 3px 8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)'
                  : '2px 3px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
                transform: `rotate(${idx % 2 === 0 ? '1deg' : '-1deg'})`,
              }}
              onClick={onClick}
            >
              {/* Tape effect at top */}
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 opacity-40"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 100%)',
                  borderRadius: '1px',
                }}
              />

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                    {ingredient.name}
                  </span>
                  <span className="text-lg">{getIngredientIcon(ingredient.name)}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-black/20 text-gray-300' : 'bg-black/10 text-gray-700'}`}>
                  {getCuisineTag(meal.analysis.cuisine, lang)}
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {ingredient.description || getIngredientDescription(ingredient.name, lang)}
              </p>
            </motion.div>
          );
        })}

        {/* Fallback if no ingredients - also sticky note style */}
        {mainIngredients.length === 0 && (
          <motion.div
            initial={{ opacity: 0, rotate: -3 }}
            animate={{ opacity: 1, rotate: 1 }}
            className={`${theme === 'dark' ? 'bg-[#4A4522]' : 'bg-[#FFF9C4]'} p-4 relative rotate-1 cursor-pointer hover:scale-[1.02] transition-transform`}
            style={{
              borderRadius: '2px',
              boxShadow: theme === 'dark'
                ? '2px 3px 8px rgba(0,0,0,0.4)'
                : '2px 3px 8px rgba(0,0,0,0.15)',
            }}
            onClick={onClick}
          >
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 opacity-40"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 100%)',
                borderRadius: '1px',
              }}
            />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                  {meal.analysis.foodName}
                </span>
                <span className="text-lg">🍽️</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-black/20 text-gray-300' : 'bg-black/10 text-gray-700'}`}>
                {getCuisineTag(meal.analysis.cuisine, lang)}
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {meal.analysis.description || (lang === Language.ZH ? '美味的一餐' : 'A delicious meal')}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

const Tab1Home: React.FC<Tab1HomeProps> = ({ lang, theme, refreshTrigger, userId }) => {
  const { meals, isLoading, refresh, deleteMeal, updateMeal } = useBackendMeals(userId, lang, 5);
  const { showSkeleton } = useMinDelay(isLoading, 300);
  const { showSuccess, showError } = useToastNotification();
  const t = TEXT[lang];

  // State for meal detail modal
  const [selectedMeal, setSelectedMeal] = useState<MealResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle meal card click
  const handleMealClick = (meal: MealResponse) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDeleteMeal = async (meal: MealResponse) => {
    // Confirmation is now handled within MealDetailModal
    await deleteMeal(meal.id);
    setIsModalOpen(false);
    setSelectedMeal(null);
  };

  // Handle share
  const handleShareMeal = async (meal: MealResponse) => {
    if (navigator.share) {
      await navigator.share({
        title: meal.analysis.foodName,
        text: `${meal.analysis.foodName} - ${Math.round(meal.analysis.nutrition?.calories || 0)} kcal`,
        url: window.location.href
      });
    }
  };

  // Handle update meal - inline editing from detail modal
  const handleUpdateMeal = async (meal: MealResponse) => {
    try {
      // Only send the fields that can be updated (mealType and notes)
      await updateMeal(meal.id, {
        mealType: meal.mealType,
        notes: meal.notes,
      });
      showSuccess(
        lang === Language.ZH ? '保存成功' : 'Saved',
        lang === Language.ZH ? '餐品信息已更新' : 'Meal updated successfully'
      );
    } catch (error) {
      console.error('Failed to update meal:', error);
      showError(
        lang === Language.ZH ? '保存失败' : 'Save Failed',
        lang === Language.ZH ? '请重试' : 'Please try again'
      );
    }
  };

  // Refresh data when refreshTrigger changes
  React.useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refresh();
    }
  }, [refreshTrigger, refresh]);

  // Extract all unique ingredients from all meals (for "近期解锁" section)
  const allIngredients = useMemo(() => {
    const ingredientMap = new Map<string, { name: string; icon: string; description: string }>();

    meals.forEach(meal => {
      const ingredients = meal.analysis?.ingredients || [];
      // Backend returns ingredients as string[], frontend expects object array
      ingredients.forEach(ing => {
        // Handle both string and object formats
        const ingredientName = typeof ing === 'string' ? ing : ing?.name;
        if (!ingredientName || typeof ingredientName !== 'string') return;

        // Filter out garnishes
        if (!GARNISH_INGREDIENTS.some(g => ingredientName.includes(g))) {
          if (!ingredientMap.has(ingredientName)) {
            ingredientMap.set(ingredientName, {
              name: ingredientName,
              icon: typeof ing === 'object' ? ing.icon || getIngredientIcon(ingredientName) : getIngredientIcon(ingredientName),
              description: typeof ing === 'object' ? ing.description || getIngredientDescription(ingredientName, lang) : getIngredientDescription(ingredientName, lang)
            });
          }
        }
      });
    });

    return Array.from(ingredientMap.values()).slice(0, 10); // Limit to 10
  }, [meals, lang]);

  const textTitle = theme === 'dark' ? 'text-white/90' : 'text-black/90';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';

  // Loading skeleton
  if (showSkeleton) {
    return (
      <div className="pb-28 pt-24 px-4 animate-fade-in space-y-6">
        <SkeletonMealItem />
      </div>
    );
  }

  // Empty state
  if (meals.length === 0) {
    return (
      <div className="pb-28 pt-24 px-4 animate-fade-in">
        <Card theme={theme} className={`${cardBg} h-64 flex flex-col items-center justify-center p-6`}>
          <div className="w-16 h-16 mb-4 opacity-70">
            <UtensilsCrossed className={`w-full h-full ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
          <p className="text-gray-500 text-sm font-medium">
            {t.no_record}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {lang === Language.ZH ? '点击下方相机图标开始记录' : 'Tap camera icon to start'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-24 px-4 animate-fade-in">
      {/* 近期解锁 Section - Horizontal Scroll Ingredient Cards */}
      {allIngredients.length > 0 && (
        <section className="mb-8">
          <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>
            {t.recent_unlocks}
          </h2>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max">
              {allIngredients.map((ingredient, index) => (
                <IngredientCard
                  key={ingredient.name}
                  name={ingredient.name}
                  description={ingredient.description}
                  icon={ingredient.icon}
                  theme={theme}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 近期饮食 Section - Meal Cards with Overlay */}
      <section>
        <h2 className={`text-lg font-semibold mb-4 ${textTitle}`}>
          {t.recent_meals}
        </h2>

        {meals.slice(0, 5).map((meal, index) => (
          <MealCard
            key={meal.id}
            meal={meal}
            lang={lang}
            theme={theme}
            index={index}
            onClick={() => handleMealClick(meal)}
          />
        ))}
      </section>

      {/* Meal Detail Modal */}
      <MealDetailModal
        meal={selectedMeal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMeal(null);
        }}
        onDelete={handleDeleteMeal}
        onUpdate={handleUpdateMeal}
        onShare={handleShareMeal}
        lang={lang}
        theme={theme}
      />
    </div>
  );
};

export default Tab1Home;
