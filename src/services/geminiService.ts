import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('GeminiService');

// In Vite, environment variables must be prefixed with VITE_ to be accessible in the browser
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';

export const analyzeFoodImage = async (base64Image: string, lang: Language): Promise<any> => {
  if (!apiKey) {
    logger.error("API Key is missing");
    throw new Error("API Key is missing. Please set GEMINI_API_KEY in .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const langInstruction = lang === Language.ZH ? "Respond in Simplified Chinese (简体中文)." : "Respond in English.";

  // Determine time context for poetic description
  const now = new Date();
  const hours = now.getHours();
  let timeContext = "";
  if (hours < 10) timeContext = "morning (breakfast time)";
  else if (hours < 14) timeContext = "mid-day (lunch time)";
  else if (hours < 17) timeContext = "afternoon (tea time)";
  else timeContext = "evening/night (dinner time)";

  const prompt = `
    You are a professional food analyst and a poet specializing in Chinese cuisine. Analyze this food image carefully.
    Current time is: ${timeContext}.

    ${langInstruction}

    IMPORTANT GUIDELINES:
    1. Identify ingredients visually - don't assume spices or oils that aren't visible
    2. For cuisine type: Be specific but accurate. Simple vegetable-protein dishes are often home-style (家常菜), not necessarily regional cuisines like Sichuan (川菜).
    3. For nutrition: Estimate based on visible ingredients.
    4. For ingredients: Focus on MAIN ingredients only (ignore garnishes like scallions, cilantro, chili peppers).
    5. **POETIC DESCRIPTION**: Write a short, poetic, and atmospheric description of the meal (1-2 sentences).
       - Adapt the tone to the current time (${timeContext}).
       - E.g., if evening, mention "twilight" or "winding down". If morning, mention "sunlight" or "energy".
       - Do NOT use same template every time. Be creative. Connect the food's visual qualities to the mood.
    6. **NUTRITION COMMENTARY**: Write a detailed, personalized nutrition analysis (3-4 sentences).
       - Analyze the nutritional balance: protein, carbs, fat ratio
       - Highlight specific health benefits of main ingredients (e.g., "Chicken provides high-quality protein for muscle repair", "Sweet potatoes offer complex carbs and fiber for sustained energy")
       - Point out any nutritional concerns (e.g., "This dish is high in sodium", "Consider adding more vegetables for fiber")
       - Provide actionable suggestions based on the meal's nutritional profile
       - Make it conversational and encouraging, like a nutritionist friend
       - AVOID generic templates - customize based on what you actually see in the image
    7. **HISTORICAL BACKGROUND**: Write a brief historical/cultural introduction for this dish (1-2 sentences).
       - Include origin, cultural significance, or interesting facts
       - Keep it concise but engaging
       - If it's a generic home-style dish, focus on its role in daily life or cooking traditions

    Provide the following details in JSON format:
    1. foodName: A short, appetizing title
    2. cuisine: The cuisine type
    3. nutrition: { calories, protein, fat, carbohydrates }
    4. ingredients: [{"name": "...", "percentage": ...}]
    5. suggestions: [3 strings]
    6. description: Comprehensive factual description
    7. poeticDescription: The poetic description mentioned above
    8. nutritionCommentary: The personalized nutrition analysis mentioned above
    9. historicalBackground: The historical/cultural introduction mentioned above
    10. plating: Visual presentation description
    11. sensory: Colors, textures, aroma
    12. container: Container description
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING },
            cuisine: { type: Type.STRING },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                carbohydrates: { type: Type.NUMBER }
              },
              required: ["calories", "protein", "fat", "carbohydrates"]
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  percentage: { type: Type.NUMBER }
                },
                required: ["name", "percentage"]
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            description: { type: Type.STRING },
            poeticDescription: { type: Type.STRING },
            nutritionCommentary: { type: Type.STRING },
            historicalBackground: { type: Type.STRING },
            plating: { type: Type.STRING },
            sensory: { type: Type.STRING },
            container: { type: Type.STRING }
          },
          required: ["foodName", "nutrition"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);

    // Ensure nutrition has all required fields
    if (!result.nutrition) {
      result.nutrition = {
        calories: result.calories || 0,
        protein: 0,
        fat: 0,
        carbohydrates: 0
      };
    }

    // Ensure ingredients exists (fallback if not provided)
    if (!result.ingredients || !Array.isArray(result.ingredients) || result.ingredients.length === 0) {
      result.ingredients = [
        { name: lang === Language.ZH ? "主要食材" : "Main Ingredient", percentage: 100 }
      ];
    }

    // Fallback for poetic fields if AI fails (ensure existence)
    if (!result.poeticDescription) {
      result.poeticDescription = lang === Language.ZH
        ? "美食与爱，不可辜负。"
        : "Love and food are meant to be cherished.";
    }

    // Fallback for historicalBackground if not provided
    if (!result.historicalBackground) {
      result.historicalBackground = lang === Language.ZH
        ? `${result.foodName || '这道菜'}是${result.cuisine || '传统'}的经典代表。`
        : `${result.foodName || 'This dish'} is a classic representative of ${result.cuisine || 'traditional'} cuisine.`;
    }

    // Generate personalized nutrition commentary if not provided by AI
    if (!result.nutritionCommentary) {
      const nutrition = result.nutrition || { calories: 0, protein: 0, fat: 0, carbohydrates: 0 };
      const ingredients = result.ingredients || [];
      const foodName = result.foodName || (lang === Language.ZH ? "这道菜" : "This dish");

      // Generate personalized commentary based on nutrition data
      const commentaryParts = [];

      // Calorie analysis
      if (lang === Language.ZH) {
        if (nutrition.calories > 600) {
          commentaryParts.push(`${foodName}热量较丰富，`);
        } else if (nutrition.calories < 300) {
          commentaryParts.push(`${foodName}热量适中，`);
        } else {
          commentaryParts.push(`${foodName}提供均衡的能量，`);
        }

        // Protein analysis
        if (nutrition.protein > 20) {
          commentaryParts.push("蛋白质含量充足，有助于肌肉修复和生长。");
        } else if (nutrition.protein > 10) {
          commentaryParts.push("含有适量蛋白质。");
        }

        // Fat analysis
        if (nutrition.fat > 25) {
          commentaryParts.push("油脂含量偏高，建议搭配清淡蔬菜平衡。");
        } else if (nutrition.fat < 10) {
          commentaryParts.push("脂肪含量较低，是比较清淡的选择。");
        }

        // Carb analysis
        if (nutrition.carbohydrates > 50) {
          commentaryParts.push("碳水化合物丰富，适合活动量较大时食用。");
        }

        // Ingredient-specific advice
        const proteinIngredients = ingredients.filter(i =>
          i.name.includes('肉') || i.name.includes('鸡') || i.name.includes('牛') ||
          i.name.includes('鱼') || i.name.includes('虾') || i.name.includes('蛋')
        );
        const vegIngredients = ingredients.filter(i =>
          i.name.includes('菜') || i.name.includes('豆') || i.name.includes('瓜') ||
          i.name.includes('茄') || i.name.includes('萝')
        );

        if (proteinIngredients.length > 0 && vegIngredients.length === 0) {
          commentaryParts.push("建议搭配蔬菜补充膳食纤维。");
        }

        result.nutritionCommentary = commentaryParts.join('');
      } else {
        // English
        if (nutrition.calories > 600) {
          commentaryParts.push(`${foodName} is rich in calories, `);
        } else if (nutrition.calories < 300) {
          commentaryParts.push(`${foodName} is moderate in calories, `);
        } else {
          commentaryParts.push(`${foodName} provides balanced energy, `);
        }

        if (nutrition.protein > 20) {
          commentaryParts.push("with high protein content for muscle repair and growth.");
        } else if (nutrition.protein > 10) {
          commentaryParts.push("with moderate protein content.");
        }

        if (nutrition.fat > 25) {
          commentaryParts.push("The fat content is on the higher side; consider pairing with vegetables.");
        } else if (nutrition.fat < 10) {
          commentaryParts.push("It's a lean choice with low fat content.");
        }

        if (nutrition.carbohydrates > 50) {
          commentaryParts.push("Rich in carbohydrates, great for active days.");
        }

        result.nutritionCommentary = commentaryParts.join(' ');
      }
    }

    // Handle legacy macros format
    if (result.macros && !result.nutrition) {
      result.nutrition = {
        calories: result.calories || 0,
        protein: parseFloat(result.macros.protein) || 0,
        fat: parseFloat(result.macros.fat) || 0,
        carbohydrates: parseFloat(result.macros.carbs) || 0
      };
      delete result.macros;
    }

    return result;

  } catch (error) {
    logger.error("Gemini Analysis Error:", error);
    // Return mock data if API fails
    return {
      foodName: lang === Language.ZH ? "宫保鸡丁" : "Kung Pao Chicken",
      cuisine: lang === Language.ZH ? "川菜" : "Sichuan",
      nutrition: {
        calories: 350,
        protein: 25,
        fat: 18,
        carbohydrates: 20
      },
      ingredients: [
        { name: lang === Language.ZH ? "鸡胸肉" : "Chicken Breast", percentage: 60 },
        { name: lang === Language.ZH ? "花生米" : "Peanuts", percentage: 25 },
        { name: lang === Language.ZH ? "辣椒" : "Chili Peppers", percentage: 15 }
      ],
      suggestions: lang === Language.ZH
        ? ["蛋白质含量丰富", "建议搭配蔬菜", "控制油脂摄入"]
        : ["Rich in protein", "Pair with vegetables", "Control oil intake"],
      description: lang === Language.ZH
        ? "经典川菜，以鸡胸肉为主料，配以花生米、辣椒等炒制而成。口感麻辣鲜香，色泽红亮。"
        : "Classic Sichuan dish with chicken breast and peanuts. Spicy, numbing, and fragrant.",
      poeticDescription: lang === Language.ZH
        ? "暮色四合，鸡肉的鲜嫩与花生的酥脆在舌尖共舞，红亮的色泽点亮了晚餐的温馨时刻。"
        : "As twilight falls, the tender chicken and crunchy peanuts dance on the palate, their bright red hue lighting up the cozy dinner moment.",
      nutritionCommentary: lang === Language.ZH
        ? "这道菜蛋白质含量很足，花生提供了优质脂肪。不过油脂略多，建议搭配一道清淡的蔬菜汤，平衡一下这一餐的油腻感。"
        : "This dish is packed with protein, and peanuts provide healthy fats. However, it's a bit oily, so pairing it with a light vegetable soup would verify balance the meal.",
      historicalBackground: lang === Language.ZH
        ? "宫保鸡丁源自清朝四川总督丁宝桢的家厨创制，因丁宝桢曾被封为\"宫保\"而得名。这道菜融合了川菜的麻辣与鲁菜的鲜香，是中国最具国际影响力的菜品之一。"
        : "Kung Pao Chicken originated from the kitchen of Ding Baozhen, a Qing Dynasty governor-general of Sichuan who was granted the title 'Palace Guardian' (Gongbao). This dish combines Sichuan's spicy flavors with Shandong's savory style, becoming one of China's most internationally influential dishes.",
      plating: lang === Language.ZH
        ? "盛放在白色圆盘中，鸡肉与花生米均匀分布，干辣椒点缀其间，色泽红亮诱人。"
        : "Served on a white round plate, chicken and peanuts evenly distributed with dried chili peppers.",
      sensory: lang === Language.ZH
        ? "红亮油润的色泽，鸡肉嫩滑，花生酥脆，麻辣鲜香的复合味道。"
        : "Bright red color, tender chicken, crunchy peanuts, complex spicy and numbing flavor.",
      container: lang === Language.ZH
        ? "白色陶瓷圆盘，边缘略带弧度"
        : "White ceramic round plate with slightly curved edges",
    };
  }
};

export const generateDishHistory = async (dishName: string, lang: Language): Promise<string> => {
  if (!apiKey) return lang === Language.ZH ? "未配置API Key，无法通过AI生成历史渊源。" : "API Key missing.";

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    You are a culinary historian. Write a brief, engaging historical introduction for the dish "${dishName}".

    Language: ${lang === Language.ZH ? 'Simplified Chinese (简体中文)' : 'English'}
    Length: 80-120 words (1 paragraph).
    Content: Origin, cultural significance, and key characteristics.
    Tone: Sophisticated yet accessible, suitable for a "Passport" collection app.

    Output ONLY the text, no markdown formatting or headings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.text;
    return text || (lang === Language.ZH ? "暂无历史渊源信息。" : "No historical information available.");
  } catch (error) {
    logger.error("Gemini History Generation Error:", error);
    return lang === Language.ZH
      ? "AI服务暂时不可用，无法获取历史渊源。"
      : "AI service temporarily unavailable.";
  }
};