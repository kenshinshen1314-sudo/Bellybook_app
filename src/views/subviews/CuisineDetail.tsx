import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Language, Theme, TEXT } from '../../types';
import { AnalysisResult } from '../../types';

interface CuisineDetailProps {
    cuisine: string;
    meals: any[]; // Using any for meal type to match existing patterns, ideally should be Meal type
    lang: Language;
    theme: Theme;
    onBack: () => void;
    onDishClick: (dishName: string) => void;
}

export const CuisineDetail: React.FC<CuisineDetailProps> = ({
    cuisine,
    meals,
    lang,
    theme,
    onBack,
    onDishClick
}) => {
    const t = TEXT[lang];
    const isDark = theme === 'dark';

    // Filter meals for this cuisine
    const cuisineMeals = useMemo(() => {
        return meals.filter(m => (m.analysis?.cuisine || (lang === Language.ZH ? '未知菜系' : 'Unknown')) === cuisine);
    }, [meals, cuisine, lang]);

    // Aggregate stats
    const stats = useMemo(() => {
        // Unique dishes (by foodName)
        const uniqueDishes = new Set(cuisineMeals.map(m => m.analysis?.foodName));
        return {
            unlocked: uniqueDishes.size,
            tastes: cuisineMeals.length,
            dishes: uniqueDishes.size // "Dishes" in UI matches "Unlocked" usually, or maybe total dishes in db? UI shows Unlocked/Tastes/Dishes. 
            // Let's assume:
            // Unlocked = Unique dishes count
            // Tastes = Total meal records
            // Dishes = Total unique dishes (same as unlocked for now)
        };
    }, [cuisineMeals]);

    // Group by dish for the list
    const dishList = useMemo(() => {
        const dishMap = new Map<string, { latest: any, count: number }>();
        cuisineMeals.forEach(meal => {
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
        return Array.from(dishMap.values()).sort((a, b) => b.latest.createdAt.localeCompare(a.latest.createdAt));
    }, [cuisineMeals]);

    // Get a cover image (use the latest meal's image)
    const coverImage = cuisineMeals.length > 0 && (cuisineMeals[0].thumbnailUrl || cuisineMeals[0].imageUrl)
        ? (cuisineMeals[0].thumbnailUrl || cuisineMeals[0].imageUrl)
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
                                    <div className="text-xl font-bold text-white">{stats.tastes}</div>
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

                {dishList.map((item) => {
                    const meal = item.latest;
                    const analysis = meal.analysis as AnalysisResult;
                    const date = new Date(meal.createdAt).toLocaleDateString(lang === Language.ZH ? 'zh-CN' : 'en-US');

                    return (
                        <motion.div
                            key={analysis.foodName}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onDishClick(analysis.foodName)}
                        >
                            <Card className={`p-3 flex items-center space-x-4 border-none shadow-sm ${isDark ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                                    <img src={meal.thumbnailUrl || meal.imageUrl} className="w-full h-full object-cover" alt={analysis.foodName} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        {/* Icon if exists, else emoji based on cuisine? Simplified for now */}
                                        <h3 className={`font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{analysis.foodName}</h3>
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
