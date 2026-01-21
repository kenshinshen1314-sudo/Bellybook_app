/**
 * [INPUT]: 依赖 @/types 的 AnalysisResult, Language, AppView
 *          依赖 @/components/ui/card 的 Card
 *          依赖 lucide-react 的 ChevronLeft, Loader2
 * [OUTPUT]: 对外提供 AnalysisResultView 组件
 * [POS]: views/ 的独立视图组件，负责展示菜品分析结果
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AppView, Language, AnalysisResult } from '../types';
import { Card } from '../components/ui/card';
import { CircularProgress } from '../components/CircularProgress';
import { Button } from '../components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';

interface AnalysisResultViewProps {
  uploadState: {
    imageUrl: string | null;
    isUploading: boolean;
    error: string | null;
    quotaExceeded: boolean;
    quotaInfo: { limit: number; remaining: number } | null;
    analysis: AnalysisResult | null;
  };
  analysisProgress: number;
  language: Language;
  mainBgClass: string;
  navigateBack: () => void;
  resetUpload: () => void;
}

/**
 * 分析结果视图
 * 展示菜品分析结果，包括图片、进度条、营养数据等
 */
export function AnalysisResultView({
  uploadState,
  analysisProgress,
  language,
  mainBgClass,
  navigateBack,
  resetUpload,
}: AnalysisResultViewProps) {
  return (
    <div className={`min-h-screen ${mainBgClass} p-4 safe-top animate-fade-in relative`}>
      {/* Back Button */}
      <button onClick={navigateBack} className="absolute top-safe-top left-4 z-50 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white">
        <ChevronLeft size={24} />
      </button>

      {/* Error State */}
      {uploadState.error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-safe-top bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl"
        >
          <p className="text-sm font-medium">{uploadState.error}</p>
          {uploadState.quotaExceeded && uploadState.quotaInfo && (
            <p className="text-xs mt-2">
              {language === Language.ZH ? '每日限额' : 'Daily limit'}: {uploadState.quotaInfo.limit}
              | {language === Language.ZH ? '剩余' : 'Remaining'}: {uploadState.quotaInfo.remaining}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              resetUpload();
              navigateBack();
            }}
          >
            {language === Language.ZH ? '返回' : 'Back'}
          </Button>
        </motion.div>
      )}

      {/* Top: Two Cards Side by Side */}
      <div className="grid grid-cols-2 gap-3 mt-safe-top mb-4">
        {/* Left Card: Uploaded Image */}
        <Card className="overflow-hidden">
          <div className="aspect-square w-full relative">
            {uploadState.imageUrl ? (
              <img
                src={uploadState.imageUrl}
                className="w-full h-full object-cover"
                alt="Uploaded dish"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </Card>

        {/* Right Card: Progress Circle */}
        <Card className="flex flex-col items-center justify-center p-4">
          <CircularProgress progress={analysisProgress} size={100} />
          <p className="text-sm font-medium mt-3 text-center">
            {uploadState.isUploading
              ? (language === Language.ZH ? '智能分析中' : 'Analyzing...')
              : (language === Language.ZH ? '分析完成' : 'Analysis Complete')}
          </p>
        </Card>
      </div>

      {/* Bottom: Three Cards */}
      {!uploadState.isUploading && uploadState.analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-3 pb-10"
        >
          {/* Card 1: Suggestions */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === Language.ZH ? '生成建议' : 'Suggestions'}
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {uploadState.analysis.dishSuggestion || (uploadState.analysis.suggestions?.map((s, i) => s).join(' ') || '-')}
            </p>
          </Card>

          {/* Card 2: Nutrition Analysis */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
              {language === Language.ZH ? '营养构成' : 'Nutrition Facts'}
            </h3>
            <div>
              {uploadState.analysis && (
                <>
                  {/* Display each dish */}
                  {uploadState.analysis.dishes.map((dish, index) => (
                    <div key={index} className={index > 0 ? 'mt-3' : ''}>
                      {/* Row 1: Dish Name */}
                      <div className="py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium">
                            {dish.foodName}
                          </span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {dish.cuisine}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Nutrition Data */}
                      <div className={`py-3 pb-4 flex items-center justify-between text-sm ${
                        index === uploadState.analysis.dishes.length - 1 ? "" : "border-b border-border"
                      }`}>
                        <span className="font-medium text-orange-500">
                          {Math.round(dish.nutrition.calories)} kcal
                        </span>
                        <span className="font-medium text-red-500">
                          P: {Math.round(dish.nutrition.protein)}g
                        </span>
                        <span className="font-medium text-yellow-500">
                          F: {Math.round(dish.nutrition.fat)}g
                        </span>
                        <span className="font-medium text-green-500">
                          C: {Math.round(dish.nutrition.carbohydrates)}g
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Total Calories Summary */}
                  {uploadState.analysis.nutrition && (
                    <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-border">
                      <span className="text-sm font-semibold text-foreground">
                        {language === Language.ZH ? '总热量' : 'Total Calories'}
                      </span>
                      <span className="text-lg font-bold text-orange-500">
                        {Math.round(uploadState.analysis.nutrition.calories)} kcal
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Card 3: Image Recognition / Description */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === Language.ZH ? '识别图像' : 'Image Recognition'}
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {uploadState.analysis.description || (language === Language.ZH ? '暂无描述' : 'No description available')}
            </p>
          </Card>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-green-600 dark:text-green-400 mt-4"
          >
            {language === Language.ZH ? '记录已自动保存到云端' : 'Record automatically saved to cloud'}
            {uploadState.quotaInfo && (
              <span className="block text-xs mt-1 text-muted-foreground">
                ({language === Language.ZH ? '今日剩余' : 'Today remaining'}: {uploadState.quotaInfo.remaining}/{uploadState.quotaInfo.limit})
              </span>
            )}
          </motion.div>

          {/* Back to Home Button */}
          <Button
            onClick={navigateBack}
            className="w-full py-6 text-lg font-semibold mt-4"
            size="lg"
          >
            {language === Language.ZH ? '保存记录' : 'Save Record'}
          </Button>
        </motion.div>
      ) : !uploadState.isUploading && !uploadState.error && (
        <div className="text-center mt-10 text-muted-foreground">
          {language === Language.ZH ? '分析失败，请重试' : 'Analysis Failed. Please try again.'}
        </div>
      )}
    </div>
  );
}
