import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Edit3, Trash2, Check } from 'lucide-react';
import { Language, Theme, TEXT } from '../types';
import type { Meal } from '../db';
import { translateCuisine, translateIngredient, translateDishName, translateDescription } from '../utils/translationUtils';

interface MealDetailModalProps {
    meal: Meal | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (meal: Meal) => Promise<void>;
    onDelete?: (meal: Meal) => void;
    onShare?: (meal: Meal) => void;
    lang: Language;
    theme: Theme;
}

// Day of week mapping
const DAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper function to normalize ingredient to object format
function normalizeIngredient(ing: string | { name: string }): { name: string } {
    return typeof ing === 'string' ? { name: ing } : ing;
}

// Generate poetic description based on food and time
function generatePoeticDescription(meal: Meal, lang: Language): string {
    const hour = new Date(meal.createdAt).getHours();
    const foodName = meal.analysis.foodName;
    // Handle both string[] and object[] formats for ingredients
    const ingredients = meal.analysis.ingredients?.map(i => {
        const ing = normalizeIngredient(i);
        return ing.name;
    }).join('与') || '';

    if (lang === Language.ZH) {
        if (hour < 10) {
            return `晨光微熹，${foodName}的香气唤醒了沉睡的味蕾。${ingredients ? `${ingredients}在盘中相遇，` : ''}一天的美好从这一餐开始。`;
        } else if (hour < 14) {
            return `正午时分，${foodName}静静等待品尝。${ingredients ? `${ingredients}的组合，` : ''}承载着生活的烟火气息。`;
        } else if (hour < 18) {
            return `午后的阳光透过窗棂，${foodName}散发着诱人的光泽。${ingredients ? `${ingredients}在味蕾间起舞，` : ''}是对自己最好的犒赏。`;
        } else {
            return `暮色四合，${foodName}在餐桌上静默。${ingredients ? `${ingredients}的邂逅，` : ''}诉说着一天的故事。窗外天色渐暗，这一餐成了暮色中唯一的亮色。`;
        }
    } else {
        if (hour < 10) {
            return `Morning light filters in as ${foodName} awakens the senses. ${ingredients ? `${ingredients} come together, ` : ''}marking the start of a beautiful day.`;
        } else if (hour < 14) {
            return `At noon, ${foodName} awaits its moment. ${ingredients ? `The harmony of ${ingredients} ` : ''}embodies life's simple pleasures.`;
        } else if (hour < 18) {
            return `Afternoon sun illuminates ${foodName}'s inviting glow. ${ingredients ? `${ingredients} dance on the palate, ` : ''}a well-deserved reward.`;
        } else {
            return `As twilight descends, ${foodName} rests on the table. ${ingredients ? `${ingredients} share their story, ` : ''}the day's narrative in each bite.`;
        }
    }
}

// Estimate meal price based on ingredients and calories
function estimateMealPrice(meal: Meal): number {
    const calories = meal.analysis.nutrition?.calories || 400;
    const ingredients = meal.analysis.ingredients || [];

    // Base price calculation: ~0.05 yuan per calorie + ingredient bonus
    let basePrice = calories * 0.05;

    // Add premium for protein-rich ingredients
    ingredients.forEach(ing => {
        // Handle both string and object formats
        const name = typeof ing === 'string' ? ing : (ing.name || '');
        const lowerName = name.toLowerCase();

        if (lowerName.includes('肉') || lowerName.includes('鸡') || lowerName.includes('牛') || lowerName.includes('猪') || lowerName.includes('鱼') || lowerName.includes('虾')) {
            basePrice += 8;
        } else if (lowerName.includes('豆腐') || lowerName.includes('蛋')) {
            basePrice += 3;
        }
    });

    return Math.round(basePrice);
}

// Get ingredient icon
const INGREDIENT_ICONS: Record<string, string> = {
    '红薯': '🍠', '香肠': '🌭', '肉': '🥩', '猪肉': '🥩', '牛肉': '🥩',
    '鸡': '🍗', '鱼': '🐟', '虾': '🦐', '蛋': '🥚', '豆腐': '🧈',
    '米饭': '🍚', '面': '🍜', '蔬菜': '🥬', '青菜': '🥬', '白菜': '🥬',
    '番茄': '🍅', '土豆': '🥔', '胡萝卜': '🥕', '玉米': '🌽',
};

function getIngredientIcon(name: string): string {
    for (const [key, icon] of Object.entries(INGREDIENT_ICONS)) {
        if (name.includes(key)) return icon;
    }
    return '🍽️';
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
    meal,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
    onShare,
    lang,
    theme,
}) => {
    const [showNutritionCard, setShowNutritionCard] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState('');
    const [editFoodNamePoetic, setEditFoodNamePoetic] = useState('');
    const [editPoeticDescription, setEditPoeticDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [localMeal, setLocalMeal] = useState<Meal | null>(null);
    const t = TEXT[lang];

    // Sync local meal state when prop changes
    useEffect(() => {
        setLocalMeal(meal);
    }, [meal]);

    // Reset edit state when meal changes
    useEffect(() => {
        if (meal) {
            setEditDescription(meal.analysis.description || '');
        }
    }, [meal]);

    if (!localMeal) return null;

    const date = new Date(localMeal.createdAt);
    const dayOfWeek = lang === Language.ZH ? DAYS_ZH[date.getDay()] : DAYS_EN[date.getDay()];
    const dateStr = lang === Language.ZH
        ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
        : `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    const estimatedPrice = estimateMealPrice(localMeal);
    const totalCalories = localMeal.analysis.nutrition?.calories || 0;

    // Use AI description if available, otherwise fallback to local generator
    const poeticDescription = localMeal.analysis.poeticDescription || generatePoeticDescription(localMeal, lang);

    // Use dishSuggestion from backend directly
    const nutritionCommentary = localMeal.analysis.dishSuggestion || '';

    const bgColor = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const secondaryText = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const cardBg = theme === 'dark' ? 'bg-[#2C2C2E]' : 'bg-gray-100';
    const inputBg = theme === 'dark' ? 'bg-[#3C3C3E]' : 'bg-gray-50';

    const handleDeleteClick = () => {
        if (isDeleting) {
            onDelete?.(localMeal);
        } else {
            setIsDeleting(true);
            setTimeout(() => setIsDeleting(false), 3000); // Reset after 3s if not confirmed
        }
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditDescription(localMeal.analysis.description || '');
        setEditFoodNamePoetic(localMeal.analysis.foodNamePoetic || '');
        setEditPoeticDescription(localMeal.analysis.poeticDescription || '');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditDescription(localMeal.analysis.description || '');
        setEditFoodNamePoetic(localMeal.analysis.foodNamePoetic || '');
        setEditPoeticDescription(localMeal.analysis.poeticDescription || '');
    };

    const handleSaveEdit = async () => {
        if (!onUpdate) return;

        setIsSaving(true);
        try {
            const updatedMeal: Meal = {
                ...localMeal,
                analysis: {
                    ...localMeal.analysis,
                    description: editDescription.trim(),
                    foodNamePoetic: editFoodNamePoetic.trim(),
                    poeticDescription: editPoeticDescription.trim(),
                },
                updatedAt: new Date().toISOString(),
            };

            await onUpdate(updatedMeal);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update localMeal:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60" />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={`relative w-full max-h-[90vh] ${bgColor} rounded-t-3xl overflow-hidden`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'} flex items-center justify-center hover:scale-110 transition-transform`}
                        >
                            <X size={18} className={theme === 'dark' ? 'text-white' : 'text-black'} />
                        </button>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto max-h-[90vh] pb-24">
                            {/* Fan Cards Section */}
                            <div className="relative flex justify-center items-center py-8 px-4">
                                <div
                                    className="relative"
                                    style={{ width: 280, height: 200 }}
                                >
                                    {/* Nutrition Card */}
                                    <motion.div
                                        className={`absolute ${theme === 'dark' ? 'bg-[#2C2C2E] border-gray-600' : 'bg-[#F5F0E8] border-gray-300'} rounded-2xl p-4 cursor-pointer border`}
                                        style={{
                                            width: 160,
                                            height: 180,
                                            left: 0,
                                            top: 10,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                        }}
                                        animate={{
                                            rotate: showNutritionCard ? 0 : -12,
                                            x: showNutritionCard ? 60 : 0,
                                            zIndex: showNutritionCard ? 20 : 10,
                                            scale: showNutritionCard ? 1 : 0.95,
                                        }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        onClick={() => setShowNutritionCard(true)}
                                    >
                                        <div className={`text-xs font-bold ${textColor} mb-1 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} pb-1`}>
                                            {lang === Language.ZH ? '胃之书营养卡片' : 'Bellybook Nutrition'}
                                        </div>
                                        <div className="space-y-2 mt-3">
                                            <div className="flex justify-between items-center">
                                                <span className={`text-sm ${secondaryText}`}>{lang === Language.ZH ? '卡路里' : 'Calories'}</span>
                                                <span className={`text-xl font-bold ${textColor}`}>{Math.round(totalCalories)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs ${secondaryText}`}>{lang === Language.ZH ? '蛋白质' : 'Protein'}</span>
                                                <span className={`text-sm font-medium ${textColor}`}>{Math.round(localMeal.analysis.nutrition?.protein || 0)}g</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs ${secondaryText}`}>{lang === Language.ZH ? '脂肪' : 'Fat'}</span>
                                                <span className={`text-sm font-medium ${textColor}`}>{(localMeal.analysis.nutrition?.fat || 0).toFixed(1)}g</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs ${secondaryText}`}>{lang === Language.ZH ? '碳水' : 'Carbs'}</span>
                                                <span className={`text-sm font-medium ${textColor}`}>{Math.round(localMeal.analysis.nutrition?.carbohydrates || 0)}g</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Meal Image */}
                                    <motion.div
                                        className="absolute rounded-2xl overflow-hidden cursor-pointer"
                                        style={{
                                            width: 160,
                                            height: 180,
                                            right: 0,
                                            top: 10,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                        }}
                                        animate={{
                                            rotate: showNutritionCard ? 12 : 0,
                                            x: showNutritionCard ? 0 : 60,
                                            zIndex: showNutritionCard ? 10 : 20,
                                            scale: showNutritionCard ? 0.95 : 1,
                                        }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        onClick={() => setShowNutritionCard(false)}
                                    >
                                        <img
                                            src={localMeal.thumbnailUrl || localMeal.imageUrl}
                                            alt={localMeal.analysis.foodName}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Date & Stats Section */}
                            <div className="px-6 space-y-3">
                                {/* Food Name - Not Editable */}
                                <div className="flex items-center gap-2">
                                    <h2 className={`text-2xl font-bold ${textColor}`}>
                                        {translateDishName(localMeal.analysis.foodName || '', lang)}
                                    </h2>
                                </div>

                                <div className={`text-lg font-semibold ${textColor}`}>{dayOfWeek}</div>

                                <div className="flex justify-between items-center">
                                    <span className={secondaryText}>{dateStr}</span>
                                    <span className={textColor}>{timeStr}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className={secondaryText}>{lang === Language.ZH ? 'AI估值' : 'AI Estimate'}</span>
                                    <span className={textColor}>{estimatedPrice} ¥</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className={secondaryText}>{lang === Language.ZH ? '总热量' : 'Total Calories'}</span>
                                    <span className={textColor}>{Math.round(totalCalories)} kcal</span>
                                </div>
                            </div>

                            {/* Poetic Description - Editable */}
                            <div className="px-6 py-6">
                                {isEditing ? (
                                    <>
                                        {/* Editable Title */}
                                        <input
                                            type="text"
                                            value={editFoodNamePoetic}
                                            onChange={(e) => setEditFoodNamePoetic(e.target.value)}
                                            placeholder={lang === Language.ZH ? '暮光中的...私语' : 'Whispers of...'}
                                            className={`w-full text-base font-semibold mb-3 ${textColor} ${inputBg} px-3 py-2 rounded-lg border-2 focus:border-orange-500 focus:outline-none`}
                                        />
                                        {/* Editable Description */}
                                        <textarea
                                            value={editPoeticDescription}
                                            onChange={(e) => setEditPoeticDescription(e.target.value)}
                                            placeholder={lang === Language.ZH ? '诗意描述...' : 'Poetic description...'}
                                            rows={4}
                                            className={`w-full text-sm leading-relaxed ${secondaryText} ${inputBg} px-3 py-2 rounded-lg border-2 focus:border-orange-500 focus:outline-none resize-none`}
                                        />
                                    </>
                                ) : (
                                    <>
                                        {/* Display Title */}
                                        <h3 className={`text-base font-semibold mb-3 ${textColor}`}>
                                            {localMeal.analysis.foodNamePoetic || (lang === Language.ZH ? `暮光中的${localMeal.analysis.foodName}私语` : `Whispers of ${localMeal.analysis.foodName}`)}
                                        </h3>
                                        {/* Display Description */}
                                        <p className={`text-sm leading-relaxed ${secondaryText}`}>
                                            {poeticDescription}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Ingredient Cards - Sticky Note Style */}
                            <div className="px-6 space-y-4">
                                {(localMeal.analysis.ingredients || []).slice(0, 3).map((ingredient, idx) => {
                                    // Handle both string and object formats
                                    const ing = typeof ingredient === 'string' ? { name: ingredient } : ingredient;

                                    const stickyColors = [
                                        { bg: 'bg-[#FFF9C4]' },
                                        { bg: 'bg-[#FFCCBC]' },
                                        { bg: 'bg-[#C8E6C9]' },
                                    ];
                                    const darkStickyColors = [
                                        { bg: 'bg-[#4A4522]' },
                                        { bg: 'bg-[#4A3530]' },
                                        { bg: 'bg-[#2A4A2C]' },
                                    ];
                                    const colors = theme === 'dark' ? darkStickyColors : stickyColors;
                                    const stickyStyle = colors[idx % colors.length];

                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`${stickyStyle.bg} p-4 relative`}
                                            style={{
                                                borderRadius: '2px',
                                                boxShadow: theme === 'dark'
                                                    ? '2px 3px 8px rgba(0,0,0,0.4)'
                                                    : '2px 3px 8px rgba(0,0,0,0.15)',
                                                transform: `rotate(${idx % 2 === 0 ? '1deg' : '-1deg'})`,
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                                                    {translateIngredient(ing.name, lang)}
                                                </span>
                                                <span className="text-lg">{getIngredientIcon(ing.name)}</span>
                                                <span className={`ml-auto text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-black/20 text-gray-300' : 'bg-black/10 text-gray-700'}`}>
                                                    {translateCuisine(localMeal.analysis.cuisine || (lang === Language.ZH ? '中国' : 'Chinese'), lang)}
                                                </span>
                                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {ing.percentage || 1} {lang === Language.ZH ? '份' : 'portion'}
                                                </span>
                                            </div>
                                            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {ing.description || translateDescription(`${ing.name}是中国家常烹饪中常见的食材，营养丰富，风味独特。`, lang)}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Nutrition Analysis Section */}
                            <div className="px-6 py-6">
                                <h3 className={`text-base font-semibold mb-3 ${textColor}`}>
                                    {lang === Language.ZH ? '本餐营养学分析' : 'Meal Nutrition Analysis'}
                                </h3>
                                <p className={`text-sm leading-relaxed ${secondaryText}`}>
                                    {nutritionCommentary || (lang === Language.ZH ? '暂无营养分析数据' : 'No nutrition analysis available')}
                                </p>
                            </div>

                            {/* Historical Background Section */}
                            {localMeal.analysis.historicalOrigins && (
                                <div className="px-6 py-6">
                                    <h3 className={`text-base font-semibold mb-3 ${textColor}`}>
                                        {t.history_source || (lang === Language.ZH ? '历史渊源' : 'History & Origin')}
                                    </h3>
                                    <p className={`text-sm leading-relaxed ${secondaryText}`}>
                                        {localMeal.analysis.historicalOrigins}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className={`absolute bottom-0 left-0 right-0 ${bgColor} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} px-6 py-4 flex items-center justify-center gap-4`}>
                            {isEditing ? (
                                <>
                                    {/* Cancel Edit Button */}
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className={`flex items-center justify-center px-6 py-2.5 rounded-full border ${theme === 'dark' ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-800'} disabled:opacity-50`}
                                    >
                                        <X size={16} className="mr-2" />
                                        <span className="text-sm font-medium">{lang === Language.ZH ? '取消' : 'Cancel'}</span>
                                    </motion.button>

                                    {/* Save Edit Button */}
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSaveEdit}
                                        disabled={isSaving}
                                        className={`flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white disabled:opacity-50`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 size={16} className="mr-2 animate-spin" />
                                                <span className="text-sm font-medium">{lang === Language.ZH ? '保存中...' : 'Saving...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check size={16} className="mr-2" />
                                                <span className="text-sm font-medium">{lang === Language.ZH ? '保存' : 'Save'}</span>
                                            </>
                                        )}
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    {/* Share Button */}
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onShare?.(localMeal)}
                                        className={`flex items-center justify-center px-6 py-2.5 rounded-full border ${theme === 'dark' ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}
                                    >
                                        <Share2 size={16} className="mr-2" />
                                        <span className="text-sm font-medium">{lang === Language.ZH ? '分享' : 'Share'}</span>
                                    </motion.button>

                                    {/* Edit Button */}
                                    {onUpdate && (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleStartEdit}
                                            className={`flex items-center justify-center px-6 py-2.5 rounded-full border ${theme === 'dark' ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}
                                        >
                                            <Edit3 size={16} className="mr-2" />
                                            <span className="text-sm font-medium">{lang === Language.ZH ? '编辑本餐' : 'Edit'}</span>
                                        </motion.button>
                                    )}

                                    {/* Delete Button */}
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleDeleteClick}
                                        className={`h-12 flex items-center justify-center rounded-full transition-all duration-300 ${isDeleting
                                            ? 'bg-red-500 w-32 px-4'
                                            : (theme === 'dark' ? 'bg-gray-700 w-12' : 'bg-gray-200 w-12')}`}
                                    >
                                        {isDeleting ? (
                                            <span className="text-white text-sm font-bold whitespace-nowrap">
                                                {lang === Language.ZH ? '确认删除?' : 'Confirm?'}
                                            </span>
                                        ) : (
                                            <Trash2 size={20} className={theme === 'dark' ? 'text-white' : 'text-gray-800'} />
                                        )}
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MealDetailModal;
