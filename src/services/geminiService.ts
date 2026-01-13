import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure this is available in your environment

export const analyzeFoodImage = async (base64Image: string, lang: Language): Promise<any> => {
  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  const langInstruction = lang === Language.ZH ? "Respond in Simplified Chinese (简体中文)." : "Respond in English.";

  const prompt = `
    Analyze this food image. ${langInstruction} Provide the following details in JSON format:
    1. Food Name: A short, appetizing title.
    2. Calories: Estimated total calories (number).
    3. Macros: Protein, Fat, Carbs content (e.g., "20g").
    4. Suggestions: 3 brief healthy eating suggestions.
    5. Description: A comprehensive description of the dish.
    6. Plating: Describe the visual presentation, arrangement, and artistic style of the plating.
    7. Sensory: Describe the colors, textures, and imagine the aroma and taste based on visual cues.
    8. Container: Describe the bowl, plate, or container (material, shape, style).
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
            calories: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.STRING },
                fat: { type: Type.STRING },
                carbs: { type: Type.STRING }
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            description: { type: Type.STRING },
            plating: { type: Type.STRING },
            sensory: { type: Type.STRING },
            container: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return mock data if API fails (graceful fallback for demo)
    return {
      foodName: lang === Language.ZH ? "未知食物" : "Unknown Food",
      calories: 0,
      macros: { protein: "0g", fat: "0g", carbs: "0g" },
      suggestions: lang === Language.ZH ? ["无法分析图片。", "请重试。"] : ["Could not analyze image.", "Please try again."],
      description: lang === Language.ZH ? "分析失败。" : "Analysis failed.",
      plating: lang === Language.ZH ? "无法识别" : "Not identified",
      sensory: lang === Language.ZH ? "无法识别" : "Not identified",
      container: lang === Language.ZH ? "无法识别" : "Not identified",
    };
  }
};