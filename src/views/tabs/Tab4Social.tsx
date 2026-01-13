import React from 'react';
import { Card } from '../../components/UIComponents';
import { Language, TEXT, Theme } from '../../types';

interface Tab4SocialProps {
  lang: Language;
  theme: Theme;
  onExpertsClick?: () => void;
  onRankingClick?: () => void;
}

const Tab4Social: React.FC<Tab4SocialProps> = ({ lang, theme, onExpertsClick, onRankingClick }) => {
  const t = TEXT[lang];
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  
  return (
    <div className={`pb-28 pt-24 px-4 animate-fade-in ${textColor} space-y-8`}>
      {/* 6.jpg Leaderboard Top */}
      <div>
         <div 
           className="flex justify-between items-end mb-4 cursor-pointer active:opacity-70 transition-opacity"
           onClick={onExpertsClick}
         >
            <h2 className="text-xl font-bold">{t.cuisine_experts}</h2>
            <span className="text-xs text-gray-500">{t.details} &gt;</span>
         </div>
         
         <div className="space-y-4">
            {[
              { name: 'Honny', rank: 1, dishes: 161, typeKey: 'cuisine_cantonese', img: 1 },
              { name: 'HanSteven', rank: 2, dishes: 107, typeKey: 'cuisine_japanese', img: 2 },
              { name: 'BellyBook', rank: 3, dishes: 99, typeKey: 'cuisine_chinese', img: 3 },
              { name: 'ghostluna', rank: 4, dishes: 97, typeKey: 'cuisine_cantonese', img: 4 },
              { name: 'Jaden', rank: 5, dishes: 97, typeKey: 'cuisine_bakery', img: 5 },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                 <div className="flex items-center">
                    <div className={`w-6 text-center font-bold mr-3 ${i < 3 ? 'text-yellow-500' : 'text-gray-500'}`}>{user.rank}</div>
                    <img src={`https://picsum.photos/50/50?random=${user.img}`} className="w-10 h-10 rounded-full bg-gray-700 mr-3" alt={user.name} />
                    <div>
                       <div className="font-semibold text-sm">{user.name}</div>
                       <div className={`text-[10px] ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'} px-2 py-0.5 rounded w-fit`}>{(t as any)[user.typeKey]}</div>
                    </div>
                 </div>
                 <div className="text-sm font-bold text-gray-400">{user.dishes} {t.dishes_count}</div>
              </div>
            ))}
         </div>
      </div>

      {/* 7.jpg Charts section */}
      <div>
         <div 
            className="flex justify-between items-end mb-4 cursor-pointer active:opacity-70 transition-opacity"
            onClick={onRankingClick}
         >
            <h2 className="text-xl font-bold">{t.gourmet_ranking}</h2>
            <span className="text-xs text-gray-500">{t.details} &gt;</span>
         </div>
         <Card theme={theme} className="h-64 p-4 flex items-end justify-between px-6" onClick={onRankingClick}>
            {[95, 79, 77, 70, 68, 63].map((val, i) => (
               <div key={i} className="flex flex-col items-center">
                  <div className={`w-8 ${theme === 'dark' ? 'bg-gradient-to-t from-gray-700 to-gray-600' : 'bg-gradient-to-t from-gray-400 to-gray-300'} rounded-t-sm relative`} style={{ height: `${val * 1.5}px` }}>
                     <div className="absolute top-0 w-full h-1 bg-white/20"></div>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-gray-800 -mt-4 z-10 border-2 ${theme === 'dark' ? 'border-[#1C1C1E]' : 'border-white'} flex items-center justify-center overflow-hidden`}>
                     <img src={`https://picsum.photos/30/30?random=${i+20}`} className="w-full h-full" alt="u" />
                  </div>
                  <span className="text-xs mt-1 text-gray-500">{val}</span>
               </div>
            ))}
         </Card>
      </div>
    </div>
  );
};

export default Tab4Social;