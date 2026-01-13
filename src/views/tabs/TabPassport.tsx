import React from 'react';
import { Card } from '../../components/UIComponents';
import { Language, TEXT, Theme } from '../../types';

interface TabPassportProps {
  lang: Language;
  theme: Theme;
}

const TabPassport: React.FC<TabPassportProps> = ({ lang, theme }) => {
  const t = TEXT[lang];
  const textColor = theme === 'dark' ? 'text-white/90' : 'text-black/90';
  const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="pb-28 pt-24 px-4 animate-fade-in flex flex-col items-center">
      {/* Dashed Placeholder Card */}
      <div className={`w-full h-64 border-2 border-dashed ${theme === 'dark' ? 'border-white/10' : 'border-black/10'} rounded-3xl flex flex-col items-center justify-center p-8 text-center mb-12`}>
         <h3 className={`${subTextColor} font-medium mb-2`}>{t.passport_empty_title}</h3>
         <p className={`${subTextColor} text-xs leading-relaxed max-w-[200px]`}>
            {t.passport_empty_desc}
         </p>
      </div>

      {/* Empty State Illustration */}
      <div className="flex flex-col items-center justify-center text-center">
         <div className="w-48 h-48 mb-6 relative">
             <img 
               src="https://img.icons8.com/external-smashingstocks-mixed-smashingstocks/200/external-Dish-food-and-cooking-smashingstocks-mixed-smashingstocks.png"
               alt="Passport Empty" 
               className={`w-full h-full object-contain ${theme === 'dark' ? 'opacity-80 invert-0' : 'opacity-80'}`} 
               style={{ filter: theme === 'dark' ? 'grayscale(100%) brightness(1.2)' : 'grayscale(100%)' }}
             />
         </div>
         <h3 className={`${subTextColor} font-medium mb-2`}>{t.passport_empty_title}</h3>
         <p className={`${subTextColor} text-xs leading-relaxed max-w-[200px]`}>
            {t.passport_empty_desc}
         </p>
      </div>
    </div>
  );
};
export default TabPassport;