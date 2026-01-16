/**
 * Translation utilities for AI-generated Chinese food data
 * Translates cuisine names, ingredients, and analysis to English
 */

import { Language } from '../types';

/**
 * Common Chinese cuisine names and their English translations
 */
const CUISINE_TRANSLATIONS: Record<string, string> = {
  // Major cuisines (八大菜系)
  '川菜': 'Sichuan Cuisine',
  '川式': 'Sichuan Style',
  '粤菜': 'Cantonese Cuisine',
  '粤式': 'Cantonese Style',
  '湘菜': 'Hunan Cuisine',
  '湘式': 'Hunan Style',
  '鲁菜': 'Shandong Cuisine',
  '鲁式': 'Shandong Style',
  '苏菜': 'Jiangsu Cuisine',
  '苏式': 'Jiangsu Style',
  '浙菜': 'Zhejiang Cuisine',
  '浙式': 'Zhejiang Style',
  '闽菜': 'Fujian Cuisine',
  '闽式': 'Fujian Style',
  '徽菜': 'Anhui Cuisine',
  '徽式': 'Anhui Style',

  // Other regional cuisines
  '本帮菜': 'Shanghai Style',
  '上海菜': 'Shanghai Cuisine',
  '北京菜': 'Beijing Cuisine',
  '东北菜': 'Northeast Chinese Cuisine',
  '客家菜': 'Hakka Cuisine',
  '潮汕菜': 'Chaoshan Cuisine',
  '西北菜': 'Northwest Cuisine',
  '云南菜': 'Yunnan Cuisine',
  '贵州菜': 'Guizhou Cuisine',
  '湖北菜': 'Hubei Cuisine',
  '新疆菜': 'Xinjiang Cuisine',

  // International cuisines
  '日本料理': 'Japanese Cuisine',
  '日料': 'Japanese',
  '寿司': 'Sushi',
  '刺身': 'Sashimi',
  '韩国料理': 'Korean Cuisine',
  '韩料': 'Korean',
  '西餐': 'Western Cuisine',
  '法式': 'French',
  '意式': 'Italian',
  '美式': 'American',
  '泰式': 'Thai',
  '印度菜': 'Indian Cuisine',
  '越南菜': 'Vietnamese Cuisine',
  '墨西哥菜': 'Mexican Cuisine',

  // General terms
  '中式': 'Chinese Style',
  '中餐': 'Chinese Food',
  '家常菜': 'Home-style Cooking',
  '火锅': 'Hot Pot',
  '烧烤': 'BBQ',
  '串串': 'Skewers',
  '面食': 'Noodle Dishes',
  '点心': 'Dim Sum',
  '小吃': 'Snacks',
};

/**
 * Common ingredient translations
 */
const INGREDIENT_TRANSLATIONS: Record<string, string> = {
  // Meats
  '猪肉': 'Pork',
  '牛肉': 'Beef',
  '羊肉': 'Lamb',
  '鸡肉': 'Chicken',
  '鸭肉': 'Duck',
  '鱼肉': 'Fish',
  '虾': 'Shrimp',
  '蟹': 'Crab',
  '贝': 'Shellfish',

  // Specific meat cuts
  '五花肉': 'Pork Belly',
  '瘦肉': 'Lean Meat',
  '排骨': 'Ribs',
  '鸡腿': 'Chicken Leg',
  '鸡翅': 'Chicken Wing',

  // Vegetables
  '白菜': 'Chinese Cabbage',
  '青菜': 'Bok Choy',
  '菠菜': 'Spinach',
  '土豆': 'Potato',
  '红薯': 'Sweet Potato',
  '番茄': 'Tomato',
  '西红柿': 'Tomato',
  '胡萝卜': 'Carrot',
  '萝卜': 'Radish',
  '豆腐': 'Tofu',
  '豆制品': 'Soy Products',
  '蘑菇': 'Mushroom',
  '香菇': 'Shiitake Mushroom',
  '木耳': 'Wood Ear Mushroom',
  '海带': 'Kelp',
  '紫菜': 'Nori',
  '莲藕': 'Lotus Root',
  '冬瓜': 'Winter Melon',
  '南瓜': 'Pumpkin',
  '丝瓜': 'Luffa',
  '茄子': 'Eggplant',
  '黄瓜': 'Cucumber',
  '豆角': 'Green Beans',
  '四季豆': 'Green Beans',
  '西兰花': 'Broccoli',
  '花菜': 'Cauliflower',
  '辣椒': 'Chili Pepper',
  '青椒': 'Green Pepper',
  '红椒': 'Red Pepper',
  '葱': 'Green Onion',
  '洋葱': 'Onion',
  '蒜': 'Garlic',
  '姜': 'Ginger',
  '香菜': 'Cilantro',
  '韭菜': 'Chinese Chives',
  '豆芽': 'Bean Sprouts',

  // Staples
  '米饭': 'Steamed Rice',
  '面条': 'Noodles',
  '馒头': 'Steamed Bun',
  '饺子': 'Dumplings',
  '包子': 'Stuffed Bun',
  '馄饨': 'Wonton',
  '汤圆': 'Tangyuan',
  '年糕': 'Nian Gao',
  '粽子': 'Zongzi',

  // Eggs and dairy
  '蛋': 'Egg',
  '鸡蛋': 'Chicken Egg',
  '鸭蛋': 'Duck Egg',
  '咸鸭蛋': 'Salted Duck Egg',
  '牛奶': 'Milk',
  '酸奶': 'Yogurt',
  '奶酪': 'Cheese',
  '黄油': 'Butter',

  // Others
  '面包': 'Bread',
  '粉条': 'Glass Noodles',
};

/**
 * Common cooking method translations
 */
const COOKING_METHOD_TRANSLATIONS: Record<string, string> = {
  '炒': 'Stir-fried',
  '红烧': 'Braised',
  '清蒸': 'Steamed',
  '炖': 'Stewed',
  '煮': 'Boiled',
  '煎': 'Pan-fried',
  '炸': 'Deep-fried',
  '烤': 'Roasted',
  '凉拌': 'Cold Dressed',
  '涮': 'Poached',
  '焖': 'Braised',
  '烩': 'Stewed',
};

/**
 * Translate cuisine name to English
 */
export function translateCuisine(cuisine: string, lang: Language): string {
  if (lang === Language.EN) {
    // Try exact match first
    if (CUISINE_TRANSLATIONS[cuisine]) {
      return CUISINE_TRANSLATIONS[cuisine];
    }

    // Try partial match (e.g., "川菜" -> "Sichuan Cuisine")
    for (const [zh, en] of Object.entries(CUISINE_TRANSLATIONS)) {
      if (cuisine.includes(zh)) {
        return en;
      }
    }
  }
  return cuisine;
}

/**
 * Translate ingredient name to English
 */
export function translateIngredient(ingredient: string, lang: Language): string {
  if (lang === Language.EN) {
    // Try exact match first
    if (INGREDIENT_TRANSLATIONS[ingredient]) {
      return INGREDIENT_TRANSLATIONS[ingredient];
    }

    // Try partial match
    for (const [zh, en] of Object.entries(INGREDIENT_TRANSLATIONS)) {
      if (ingredient.includes(zh)) {
        return en;
      }
    }
  }
  return ingredient;
}

/**
 * Translate dish name (simple word-by-word translation)
 */
export function translateDishName(dishName: string, lang: Language): string {
  if (lang === Language.ZH) {
    return dishName;
  }

  // Simple translation - try to replace known words
  let translated = dishName;

  // Translate cooking methods first (they usually appear at the end)
  for (const [zh, en] of Object.entries(COOKING_METHOD_TRANSLATIONS)) {
    translated = translated.replace(new RegExp(zh + '.*$'), en + ' ' + dishName.replace(zh, ''));
    translated = translated.replace(zh, en);
  }

  // Translate cuisines
  for (const [zh, en] of Object.entries(CUISINE_TRANSLATIONS)) {
    translated = translated.replace(zh, en);
  }

  // Translate ingredients
  for (const [zh, en] of Object.entries(INGREDIENT_TRANSLATIONS)) {
    translated = translated.replace(zh, en);
  }

  // Clean up extra spaces
  translated = translated.replace(/\s+/g, ' ').trim();

  return translated || dishName;
}

/**
 * Translate ingredient description
 */
export function translateDescription(description: string, lang: Language): string {
  if (lang === Language.ZH) {
    return description;
  }

  let translated = description;

  // Translate known words
  const allTranslations = {
    ...CUISINE_TRANSLATIONS,
    ...INGREDIENT_TRANSLATIONS,
  };

  for (const [zh, en] of Object.entries(allTranslations)) {
    translated = translated.replace(new RegExp(zh, 'g'), en);
  }

  // Common phrase translations
  const phraseTranslations: Record<string, string> = {
    '是中国': 'is a Chinese',
    '是常见的': 'is a common',
    '富含': 'rich in',
    '含有丰富的': 'rich in',
    '营养': 'nutrition',
    '营养丰富': 'nutritious',
    '风味独特': 'unique flavor',
    '家常烹饪': 'home cooking',
    '常见的食材': 'common ingredient',
    '搭配': 'paired with',
    '中含有': 'contains',
    '蛋白质': 'protein',
    '维生素': 'vitamins',
    '膳食纤维': 'dietary fiber',
    '矿物质': 'minerals',
    '低脂肪': 'low fat',
    '健康食品': 'healthy food',
    '广受欢迎': 'widely popular',
    '经常用于': 'commonly used in',
    '是制作': 'is used for making',
    '的重要食材': 'is an important ingredient',
    '具有': 'has',
    '口感': 'texture',
    '清香': 'fragrant',
    '爽脆': 'crisp',
    '软糯': 'soft',
    '滑嫩': 'tender',
    '多汁': 'juicy',
    '味道': 'taste',
    '香甜': 'sweet',
    '鲜美': 'savory',
    '清淡': 'light',
  };

  for (const [zh, en] of Object.entries(phraseTranslations)) {
    translated = translated.replace(new RegExp(zh, 'g'), en);
  }

  return translated;
}

/**
 * Translate nutrition analysis text
 */
export function translateNutritionAnalysis(analysis: string, lang: Language): string {
  if (lang === Language.ZH) {
    return analysis;
  }

  let translated = analysis;

  // Translate key terms
  const termTranslations: Record<string, string> = {
    '热量': 'calories',
    '蛋白质': 'protein',
    '脂肪': 'fat',
    '碳水化合物': 'carbohydrates',
    '营养均衡': 'nutritionally balanced',
    '营养丰富': 'nutritious',
    '高蛋白': 'high protein',
    '低脂肪': 'low fat',
    '健康': 'healthy',
    '适量': 'moderate amount',
    '建议': 'recommended',
    '富含': 'rich in',
    '含有': 'contains',
    '提供': 'provides',
    '适合': 'suitable for',
    '搭配': 'paired with',
    '补充': 'supplement',
    '膳食纤维': 'dietary fiber',
    '维生素': 'vitamins',
    '矿物质': 'minerals',
    '能量': 'energy',
    '均衡': 'balanced',
    '有助于': 'helps with',
    '促进': 'promotes',
    '支持': 'supports',
    '含量': 'content',
    '充足': 'sufficient',
    '偏高': 'on the higher side',
    '较低': 'relatively low',
    '适中': 'moderate',
    '丰富': 'rich',
  };

  // Translate common phrase patterns
  const phraseTranslations: Record<string, string> = {
    '热量较丰富': 'is rich in calories',
    '热量适中': 'is moderate in calories',
    '提供均衡的能量': 'provides balanced energy',
    '蛋白质含量充足': 'has sufficient protein content',
    '含有适量蛋白质': 'contains moderate protein',
    '有助于肌肉修复和生长': 'helps with muscle repair and growth',
    '油脂含量偏高': 'fat content is on the higher side',
    '建议搭配清淡蔬菜平衡': 'consider pairing with light vegetables',
    '脂肪含量较低': 'has relatively low fat content',
    '是比较清淡的选择': 'is a relatively light choice',
    '碳水化合物丰富': 'rich in carbohydrates',
    '适合活动量较大时食用': 'suitable for times with higher activity levels',
    '建议搭配蔬菜补充膳食纤维': 'recommend pairing with vegetables for dietary fiber',
  };

  // Apply phrase translations first (more specific)
  for (const [zh, en] of Object.entries(phraseTranslations)) {
    translated = translated.replace(new RegExp(zh, 'g'), en);
  }

  // Apply term translations
  for (const [zh, en] of Object.entries(termTranslations)) {
    translated = translated.replace(new RegExp(zh, 'g'), en);
  }

  return translated;
}

/**
 * Translate historical background
 */
export function translateHistoricalBackground(history: string, lang: Language): string {
  if (lang === Language.ZH) {
    return history;
  }

  let translated = history;

  // Translate terms
  const commonTerms: Record<string, string> = {
    '起源于': 'originated from',
    '历史': 'history',
    '传统': 'traditional',
    '著名': 'famous',
    '菜肴': 'dish',
    '文化': 'culture',
    '清朝': 'Qing Dynasty',
    '明朝': 'Ming Dynasty',
    '唐朝': 'Tang Dynasty',
    '宋朝': 'Song Dynasty',
    '中国': 'China',
    '地区': 'region',
    '有着': 'has a',
    '悠久': 'long',
    '可以追溯到': 'can be traced back to',
    '年代': 'era',
    '时期': 'period',
    '流传': 'spread',
    '至今': 'until today',
    '深受': 'deeply loved by',
    '喜爱': 'people',
    '代表': 'representative',
    '特色菜': 'signature dish',
    '名菜': 'famous dish',
    '制作工艺': 'cooking technique',
    '独特': 'unique',
    '风味': 'flavor',
    '口感': 'texture',
    '闻名': 'famous for',
    '被誉为': 'known as',
    '之一': 'one of',
  };

  // Translate common phrases
  const phraseTranslations: Record<string, string> = {
    '有着悠久的历史': 'has a long history',
    '可以追溯到': 'can be traced back to',
    '深受人们喜爱': 'deeply loved by people',
    '是中国传统名菜': 'is a traditional Chinese dish',
    '具有独特的风味': 'has a unique flavor',
    '被誉为': 'is known as',
    '至今已流传': 'has been passed down for',
    '制作工艺独特': 'has unique cooking techniques',
    '口感鲜美': 'delicious in taste',
    '闻名于世': 'famous worldwide',
    '是中国菜系中的代表菜之一': 'is one of the representative dishes of Chinese cuisine',
  };

  // Apply phrase translations first
  for (const [zh, en] of Object.entries(phraseTranslations)) {
    translated = translated.replace(new RegExp(zh, 'g'), en);
  }

  // Apply term translations
  for (const [zh, en] of Object.entries(commonTerms)) {
    translated = translated.replace(new RegExp(zh, 'g'), en);
  }

  return translated;
}
