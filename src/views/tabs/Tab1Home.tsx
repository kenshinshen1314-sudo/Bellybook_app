import React from 'react';
import { Card } from '../../components/UIComponents';
import { Language, TEXT, Theme } from '../../types';

interface Tab1HomeProps {
  lang: Language;
  theme: Theme;
}

const Tab1Home: React.FC<Tab1HomeProps> = ({ lang, theme }) => {
  const t = TEXT[lang];
  const textTitle = theme === 'dark' ? 'text-white/90' : 'text-black/90';
  
  // Custom text based on screenshot provided in prompt history
  const recentUnlocksText = lang === Language.ZH ? '近期解锁' : 'Recent Unlocks';
  const recentMealsText = lang === Language.ZH ? '近期饮食' : 'Recent Meals';
  const noUnlockText = lang === Language.ZH ? '暂无解锁菜肴' : 'No unlocked dishes';
  const noRecordText = lang === Language.ZH ? '暂无餐饮记录' : 'No meal records';
  const startRecordText = lang === Language.ZH ? '记录餐饮获得点数，即可开始集换式卡牌之旅。' : 'Record meals to earn points and start your trading card journey.';

  return (
    <div className="pb-28 pt-24 px-4 animate-fade-in space-y-6">
      {/* 1.jpg "Recent Unlocks" section */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>{recentUnlocksText}</h2>
        <Card theme={theme} className={`h-40 flex flex-col items-center justify-center p-6 ${theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
          <div className="w-16 h-16 mb-4 opacity-70 relative">
             <img 
               src="https://img.icons8.com/ios/100/cloche.png" 
               alt="Empty" 
               className={`w-full h-full object-contain ${theme === 'dark' ? 'invert brightness-90 sepia-[.2]' : 'opacity-60'}`} 
             />
          </div>
          <p className="text-gray-500 text-sm font-medium">{noUnlockText}</p>
        </Card>
      </div>

      {/* "Recent Meals" section */}
      <div>
        <h2 className={`text-lg font-semibold mb-3 ${textTitle}`}>{recentMealsText}</h2>
        <Card theme={theme} className={`min-h-[320px] flex flex-col items-center justify-center p-8 text-center ${theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
          <div className="w-32 h-32 mb-6 opacity-80">
            <img 
               src="https://img.icons8.com/ios/100/restaurant-table.png" 
               alt="Empty Plate" 
               className={`w-full h-full object-contain ${theme === 'dark' ? 'invert brightness-90 sepia-[.2]' : 'opacity-60'}`} 
            />
          </div>
          <h3 className="text-gray-400 font-bold mb-3 text-base">{noRecordText}</h3>
          <p className="text-gray-500 text-xs leading-relaxed max-w-[220px]">
            {startRecordText}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Tab1Home;