import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Language, Theme, TEXT } from '../../types';
import { generateDishHistory } from '../../services/geminiService';
import { MealDetailModal } from '../../components/MealDetailModal';

interface DishDetailProps {
    dishName: string;
    meals: any[];
    lang: Language;
    theme: Theme;
    onBack: () => void;
}

export const DishDetail: React.FC<DishDetailProps> = ({
    dishName,
    meals,
    lang,
    theme,
    onBack,
}) => {
    const t = TEXT[lang];
    const isDark = theme === 'dark';

    // State for Meal Detail Modal
    const [selectedMeal, setSelectedMeal] = useState<any>(null);
    const [historyText, setHistoryText] = useState<string>('');
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Filter meals for this dish
    const dishMeals = useMemo(() => {
        return meals.filter(m => m.analysis?.foodName === dishName).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [meals, dishName]);

    // Aggregate Info
    const info = useMemo(() => {
        if (dishMeals.length === 0) return null;
        const latest = dishMeals[0];
        const cuisine = latest.analysis?.cuisine || '';

        // Average or total stats? Usually average per serving or specific.
        // UI shows "1 Tasted", "280 kcal". Let's use the LATEST meal's nutrition for display, or average.
        // Let's use Latest for now as it's most relevant to "current" state of knowledge.
        const nut = latest.analysis?.nutrition || { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };

        return {
            imageUrl: latest.thumbnailUrl || latest.imageUrl,
            cuisine,
            count: dishMeals.length,
            calories: Math.round(nut.calories),
            protein: Math.round(nut.protein),
            fat: Math.round(nut.fat),
            carbs: Math.round(nut.carbohydrates),
        };
    }, [dishMeals]);

    // Fetch History
    useEffect(() => {
        const fetchHistory = async () => {
            setLoadingHistory(true);
            // Check if we have cached history? For now, real-time fetch (or mock if no key)
            const text = await generateDishHistory(dishName, lang);
            setHistoryText(text);
            setLoadingHistory(false);
        };
        fetchHistory();
    }, [dishName, lang]);

    if (!info) return null;

    return (
        <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-gray-50'} animate-slide-left relative`}>
            <div className="pt-6 px-4 pb-10 space-y-6">
                {/* Main Card */}
                <Card className={`p-6 border-none shadow-sm ${isDark ? 'bg-[#1C1C1E] text-white' : 'bg-white'}`}>
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            {/* Food Icon/Image small */}
                            <div className="w-12 h-12 rounded-full overflow-hidden mb-3">
                                <img src={info.imageUrl} className="w-full h-full object-cover" alt="icon" />
                            </div>
                            <h1 className="text-2xl font-serif font-bold mb-1">{dishName}</h1>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {info.cuisine}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-baseline space-x-8 mb-6">
                        <div>
                            <div className="text-2xl font-bold">{info.count}</div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{lang === Language.ZH ? '已品尝' : 'Tasted'}</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{info.calories}</div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>kcal</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                <div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div>
                                {t.macro_protein}
                            </div>
                            <div className="text-lg font-medium">{info.protein}g</div>
                        </div>
                        <div>
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></div>
                                {t.macro_fat}
                            </div>
                            <div className="text-lg font-medium">{info.fat}g</div>
                        </div>
                        <div>
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                                <div className="w-2 h-2 rounded-full bg-green-400 mr-1"></div>
                                {t.macro_carbs}
                            </div>
                            <div className="text-lg font-medium">{info.carbs}g</div>
                        </div>
                    </div>
                </Card>

                {/* History Section */}
                <div>
                    <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.history_source}</h3>
                    <Card className={`p-4 border-none shadow-sm ${isDark ? 'bg-[#1C1C1E] text-gray-300' : 'bg-white text-gray-600'}`}>
                        <p className="text-sm leading-relaxed">
                            {loadingHistory
                                ? (lang === Language.ZH ? '正在生成历史渊源...' : 'Generating history...')
                                : historyText}
                        </p>
                    </Card>
                </div>

                {/* Tasting Records */}
                <div>
                    <h3 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.tasting_records}</h3>
                    <div className="space-y-3">
                        {dishMeals.map((meal) => {
                            const date = new Date(meal.createdAt);
                            const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
                            const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

                            return (
                                <motion.div
                                    key={meal.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedMeal(meal)}
                                >
                                    <Card className={`p-3 flex items-center space-x-3 border-none shadow-sm ${isDark ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                            <img src={meal.thumbnailUrl || meal.imageUrl} className="w-full h-full object-cover" alt="meal" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {meal.analysis?.poeticDescription || meal.analysis?.foodName || (lang === Language.ZH ? '无标题' : 'No Title')}
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
                        : 'bg-white shadow-md text-black'
                }`}
            >
                <ArrowLeft size={24} />
            </button>
        </div>
    );
};
