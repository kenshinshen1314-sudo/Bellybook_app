import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Flame, Utensils, Wheat, Droplet } from 'lucide-react';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Language, Theme } from '@/types';
import { type MealAnalysis } from '@/db';
import { translateDishName, translateCuisine } from '@/utils/translationUtils';

interface MealAnalysisCardProps {
  imageUrl: string;
  analysis: MealAnalysis;
  language: Language;
  theme: Theme;
}

/**
 * MealAnalysisCard - Displays AI analysis result for a meal
 * Shows food image, nutrition info, and description
 */
export function MealAnalysisCard({ imageUrl, analysis, language, theme }: MealAnalysisCardProps) {
  const styles = useThemeStyles(theme);
  const nutrition = analysis.nutrition || { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };
  const foodName = translateDishName(
    analysis.foodName || (language === 'zh' ? '未知食物' : 'Unknown Food'),
    language
  );
  const cuisine = translateCuisine(analysis.cuisine || '', language);
  const description = analysis.description;
  const suggestions = analysis.suggestions || [];

  return (
    <Card className={`${styles.bgCard} overflow-hidden`}>
      {/* Food Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={foodName}
          className="w-full h-full object-cover"
        />
        {/* Cuisine Badge */}
        {cuisine && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-sm">
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              {cuisine}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Food Name */}
        <div>
          <h3 className={`text-xl font-bold ${styles.textTitle}`}>
            {foodName}
          </h3>
          {description && (
            <p className={`text-sm mt-1 ${styles.textSecondary} leading-relaxed`}>
              {description}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className={`h-px ${styles.border}`} />

        {/* Nutrition Grid */}
        <div>
          <h4 className={`text-sm font-semibold mb-3 ${styles.textTitle}`}>
            {language === 'zh' ? '营养成分' : 'Nutrition Facts'}
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {/* Calories */}
            <NutritionItem
              icon={<Flame size={18} className="text-orange-500" />}
              value={nutrition.calories}
              unit="kcal"
              label={language === 'zh' ? '热量' : 'Calories'}
              textPrimary={styles.textTitle}
              textSecondary={styles.textSecondary}
            />
            {/* Protein */}
            <NutritionItem
              icon={<Utensils size={18} className="text-red-500" />}
              value={nutrition.protein}
              unit="g"
              label={language === 'zh' ? '蛋白质' : 'Protein'}
              textPrimary={styles.textTitle}
              textSecondary={styles.textSecondary}
            />
            {/* Fat */}
            <NutritionItem
              icon={<Droplet size={18} className="text-yellow-500" />}
              value={nutrition.fat}
              unit="g"
              label={language === 'zh' ? '脂肪' : 'Fat'}
              textPrimary={styles.textTitle}
              textSecondary={styles.textSecondary}
            />
            {/* Carbs */}
            <NutritionItem
              icon={<Wheat size={18} className="text-amber-600" />}
              value={nutrition.carbohydrates}
              unit="g"
              label={language === 'zh' ? '碳水' : 'Carbs'}
              textPrimary={styles.textTitle}
              textSecondary={styles.textSecondary}
            />
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <>
            <div className={`h-px ${styles.border}`} />
            <div>
              <h4 className={`text-sm font-semibold mb-2 ${styles.textTitle}`}>
                {language === 'zh' ? '建议' : 'Suggestions'}
              </h4>
              <ul className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className={`text-xs ${styles.textTertiary} flex items-start`}>
                    <span className="mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

interface NutritionItemProps {
  icon: React.ReactNode;
  value: number;
  unit: string;
  label: string;
  textPrimary: string;
  textSecondary: string;
}

function NutritionItem({ icon, value, unit, label, textPrimary, textSecondary }: NutritionItemProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-1">{icon}</div>
      <div className={`text-lg font-bold ${textPrimary}`}>
        {Math.round(value)}
      </div>
      <div className={`text-xs ${textSecondary}`}>{unit}</div>
      <div className={`text-xs ${textSecondary} mt-1`}>{label}</div>
    </div>
  );
}
