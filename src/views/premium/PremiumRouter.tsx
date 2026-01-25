/**
 * [INPUT]: 依赖 contexts/AppContext 的 useApp, components/ui 的 Button
 * [OUTPUT]: 对外提供 PremiumRouter 组件，处理所有 PREMIUM_* 视图路由
 * [POS]: views/premium/ 的 Premium 视图路由器，被 AppRouter 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 ../../CLAUDE.md
 */

import React from 'react';
import { ArrowLeft, Zap, Edit3, BookOpen, BarChart3, Check, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useViewState } from '@/hooks/useViewState';
import { NavBar } from '@/components/UIComponents';
import { Button } from '@/components/ui/button';
import { LimitReachedOverlay } from '@/components/LimitReachedOverlay';
import { AppView } from '@/types';
import { motion } from 'framer-motion';

// ============================================================
// Premium 子视图组件
// ============================================================

/**
 * PremiumLanding - Premium 会员落地页
 */
function PremiumLanding() {
  const { theme, language, navigateBack, setCurrentView } = useApp();
  const { showLimitOverlay, setShowLimitOverlay, selectedPlan, setSelectedPlan } = useViewState();

  const t = {
    premium_title: language === 'zh' ? '解锁无限可能' : 'Unlock Unlimited',
    premium_subtitle: language === 'zh' ? '成为会员，探索美食的无限世界' : 'Become a member to explore the infinite world of food',
    feat_1_title: language === 'zh' ? '无限AI分析' : 'Unlimited AI Analysis',
    feat_1_desc: language === 'zh' ? '每日无限次拍照分析' : 'Unlimited photo analysis daily',
    feat_2_title: language === 'zh' ? '极速响应' : 'Lightning Fast',
    feat_2_desc: language === 'zh' ? '优先处理队列' : 'Priority processing queue',
    feat_3_title: language === 'zh' ? '独家徽章' : 'Exclusive Badges',
    feat_3_desc: language === 'zh' ? '解锁特殊成就徽章' : 'Unlock special achievement badges',
    feat_4_title: language === 'zh' ? '数据导出' : 'Data Export',
    feat_4_desc: language === 'zh' ? '导出您的美食数据' : 'Export your food data',
    subscribe_monthly: language === 'zh' ? '月付' : 'Monthly',
    subscribe_yearly: language === 'zh' ? '年付' : 'Yearly',
    plan_monthly_price: language === 'zh' ? '¥18/月' : '$2.99/mo',
    plan_monthly_desc: language === 'zh' ? '按月订阅\n随时取消' : 'Billed monthly\nCancel anytime',
    plan_yearly_price: language === 'zh' ? '¥98/年' : '$19.99/yr',
    plan_yearly_desc: language === 'zh' ? '省30%\n年均最优惠' : 'Save 30%\nBest value',
    subscribe_btn: language === 'zh' ? '立即订阅' : 'Subscribe Now',
    restore: language === 'zh' ? '恢复购买' : 'Restore',
    redeem: language === 'zh' ? '兑换代码' : 'Redeem',
  };

  return (
    <div className="min-h-screen bg-background p-4 pt-safe-top relative overflow-hidden flex flex-col">
      {/* Limit Overlay */}
      {showLimitOverlay && (
        <LimitReachedOverlay
          lang={language}
          onDismiss={() => setShowLimitOverlay(false)}
        />
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={navigateBack} className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`}>
          <ArrowLeft size={24} className={theme === 'dark' ? 'text-white' : 'text-black'} />
        </button>
        <div className="flex space-x-1">
          <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`} />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8 px-4">
        <h1 className={`text-xl font-serif font-medium mb-3 ${theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]'}`}>
          {t.premium_title}
        </h1>
        <p className="text-muted-foreground text-xs tracking-wide">{t.premium_subtitle}</p>
      </div>

      {/* Feature Cards - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 mb-8 px-2">
        {/* Card 1 */}
        <div className="bg-gradient-to-br from-[#E85D75]/30 to-[#C0392B]/20 p-4 rounded-xl border border-[#E85D75]/30 flex flex-col h-32 relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-50"><Edit3 size={32} color="#E85D75" /></div>
          <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-[#FF9A9E]' : 'text-[#D14D68]'}`}>{t.feat_1_title}</div>
          <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_1_desc}</p>
        </div>

        {/* Card 2 */}
        <div className="bg-gradient-to-br from-[#D2E603]/30 to-[#76B900]/20 p-4 rounded-xl border border-[#D2E603]/30 flex flex-col h-32 relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-50"><Zap size={32} color="#D2E603" /></div>
          <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-[#E6FF50]' : 'text-[#8EA800]'}`}>{t.feat_2_title}</div>
          <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_2_desc}</p>
        </div>

        {/* Card 3 */}
        <div className="bg-gradient-to-br from-[#F3E5AB]/30 to-[#D4AF37]/20 p-4 rounded-xl border border-[#F3E5AB]/30 flex flex-col h-32 relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-50"><BookOpen size={32} color="#F3E5AB" /></div>
          <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-[#F3E5AB]' : 'text-[#B8860B]'}`}>{t.feat_3_title}</div>
          <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_3_desc}</p>
        </div>

        {/* Card 4 */}
        <div className="bg-gradient-to-br from-gray-500/30 to-gray-700/20 p-4 rounded-xl border border-transparent flex flex-col h-32 relative overflow-hidden">
          <div className="absolute top-2 right-2 opacity-50"><BarChart3 size={32} color="gray" /></div>
          <div className={`font-bold mb-2 z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-700'}`}>{t.feat_4_title}</div>
          <p className={`text-[10px] leading-tight z-10 ${theme === 'dark' ? 'text-muted-foreground' : 'text-foreground'}`}>{t.feat_4_desc}</p>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-2 gap-4 px-2 mb-6">
        {/* Monthly */}
        <div
          onClick={() => setSelectedPlan('monthly')}
          className={`rounded-2xl p-4 border transition-all cursor-pointer ${selectedPlan === 'monthly'
            ? `border-[#E0CEB5] ${theme === 'dark' ? 'bg-[#E0CEB5]/10' : 'bg-[#E0CEB5]/20'}`
            : `border-transparent ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`
            }`}
        >
          <div className={`text-sm mb-2 ${selectedPlan === 'monthly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-foreground')}`}>
            {t.subscribe_monthly}
          </div>
          <div className={`text-2xl font-serif mb-2 ${selectedPlan === 'monthly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-black')}`}>
            {t.plan_monthly_price}
          </div>
          <p className={`text-[10px] whitespace-pre-wrap ${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            {t.plan_monthly_desc}
          </p>
        </div>

        {/* Yearly */}
        <div
          onClick={() => setSelectedPlan('yearly')}
          className={`rounded-2xl p-4 border transition-all cursor-pointer ${selectedPlan === 'yearly'
            ? `border-[#E0CEB5] ${theme === 'dark' ? 'bg-[#E0CEB5]/10' : 'bg-[#E0CEB5]/20'}`
            : `border-transparent ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`
            }`}
        >
          <div className={`text-sm mb-2 ${selectedPlan === 'yearly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-foreground')}`}>
            {t.subscribe_yearly}
          </div>
          <div className={`text-2xl font-serif mb-2 ${selectedPlan === 'yearly' ? (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]') : (theme === 'dark' ? 'text-[#E0CEB5]' : 'text-black')}`}>
            {t.plan_yearly_price}
          </div>
          <p className={`text-[10px] whitespace-pre-wrap ${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            {t.plan_yearly_desc}
          </p>
        </div>
      </div>

      {/* Subscribe Button */}
      <div className="mt-auto px-4 pb-8">
        <Button
          fullWidth
          onClick={() => setCurrentView(AppView.PAYMENT_GATEWAY)}
          className="h-12 bg-gradient-to-r from-[#E0CEB5] to-[#D4AF37] text-black font-bold tracking-wide shadow-lg shadow-yellow-900/20"
        >
          {t.subscribe_btn}
        </Button>
        <div className={`flex justify-center mt-4 space-x-8 text-xs ${theme === 'dark' ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          <span className="cursor-pointer">{t.restore}</span>
          <span className="cursor-pointer">{t.redeem}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * PaymentGateway - 支付网关页面
 */
function PaymentGateway() {
  const { theme, language, setCurrentView, navigateBack } = useApp();
  const { isPremium, setIsPremium, selectedPlan } = useViewState();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPremium(true);
    setCurrentView(AppView.MAIN_TABS);
  };

  return (
    <div className="min-h-screen bg-background p-4 pt-safe-top flex flex-col">
      {/* Navigation */}
      <NavBar
        theme={theme}
        title={language === 'zh' ? '支付' : 'Payment'}
        leftIcon={<ArrowLeft size={32} strokeWidth={2.5} className={theme === 'dark' ? 'text-white' : 'text-black'} />}
        onLeftClick={navigateBack}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#E0CEB5] to-[#D4AF37] flex items-center justify-center">
            <Check size={48} className="text-black" />
          </div>

          <h1 className={`text-2xl font-bold mb-3 ${theme === 'dark' ? 'text-[#E0CEB5]' : 'text-[#B8860B]'}`}>
            {selectedPlan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
          </h1>

          <p className="text-muted-foreground mb-8">
            {selectedPlan === 'monthly' ? '$2.99/month' : '$19.99/year (Save 30%)'}
          </p>

          {isProcessing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Button
              onClick={handleSubscribe}
              className="w-full max-w-sm h-12 bg-gradient-to-r from-[#E0CEB5] to-[#D4AF37] text-black font-bold tracking-wide shadow-lg"
            >
              Confirm Payment
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// PremiumRouter - 主路由器
// ============================================================

/**
 * PremiumRouter - Premium 视图路由器
 *
 * 处理所有 PREMIUM_* 视图：
 * - PREMIUM_LANDING: 会员落地页
 * - PAYMENT_GATEWAY: 支付页面
 */
export function PremiumRouter() {
  const { currentView } = useApp();

  if (currentView === AppView.PAYMENT_GATEWAY) {
    return <PaymentGateway />;
  }

  return <PremiumLanding />;
}
