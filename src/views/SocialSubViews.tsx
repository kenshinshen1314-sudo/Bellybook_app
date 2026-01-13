import React, { useState } from 'react';
import { NavBar, Card } from '../components/UIComponents';
import { Language, TEXT, Theme } from '../types';
import { ChevronLeft, Share2 } from 'lucide-react';

interface LeaderboardProps {
  title: string;
  type: 'experts' | 'ranking';
  lang: Language;
  theme: Theme;
  onBack: () => void;
  onUserClick: (user: any) => void;
}

const mockUsers = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  name: `User_${Math.floor(Math.random() * 1000)}`,
  avatar: `https://picsum.photos/50/50?random=${i + 100}`,
  count: Math.floor(Math.random() * 200) + 50,
  labelKey: ['cuisine_cantonese', 'cuisine_japanese', 'cuisine_italian', 'cuisine_french'][i % 4]
}));

export const LeaderboardPage: React.FC<LeaderboardProps> = ({ title, type, lang, theme, onBack, onUserClick }) => {
  const t = TEXT[lang];
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('week');
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const bgClass = theme === 'dark' ? 'bg-[#101010]' : 'bg-[#F2F2F7]';
  const itemBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';

  const periods = [
    { key: 'week', label: t.this_week },
    { key: 'month', label: t.this_month },
    { key: 'year', label: t.this_year },
    { key: 'all', label: t.all_time },
  ];

  return (
    <div className={`min-h-screen ${bgClass} pb-safe-bottom animate-slide-left`}>
      <NavBar 
        title={title} 
        theme={theme} 
        leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className={theme === 'dark' ? "text-white" : "text-black"} />}
        onLeftClick={onBack}
        className={theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'}
      />
      
      {/* Time Filter Tabs */}
      <div className={`pt-16 px-4 mb-4`}>
        <div className={`flex p-1 rounded-xl ${theme === 'dark' ? 'bg-[#2C2C2E]' : 'bg-gray-200'}`}>
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key as any)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === p.key 
                  ? (theme === 'dark' ? 'bg-[#636366] text-white shadow-sm' : 'bg-white text-black shadow-sm') 
                  : 'text-gray-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-3">
        {mockUsers.map((user, index) => (
          <div 
            key={user.id} 
            onClick={() => onUserClick(user)}
            className={`flex items-center justify-between p-4 rounded-2xl ${itemBg} active:scale-[0.98] transition-transform`}
          >
            <div className="flex items-center">
              <div className={`w-8 font-bold text-lg mr-4 text-center ${index < 3 ? 'text-yellow-500' : 'text-gray-400'}`}>
                {index + 1}
              </div>
              <img src={user.avatar} className="w-12 h-12 rounded-full mr-4 bg-gray-300" alt={user.name} />
              <div>
                <div className={`${textColor} font-semibold`}>{user.name}</div>
                {type === 'experts' && (
                  <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full w-fit mt-1">
                    {(t as any)[user.labelKey]}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${textColor}`}>{user.count}</div>
              <div className="text-[10px] text-gray-400">
                {type === 'experts' ? t.dishes_count : t.cuisine_count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UserDetailPage: React.FC<{ 
  user: any; 
  lang: Language; 
  theme: Theme; 
  onBack: () => void; 
}> = ({ user, lang, theme, onBack }) => {
  const t = TEXT[lang];
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const subTextColor = 'text-gray-500';
  const bgClass = theme === 'dark' ? 'bg-[#101010]' : 'bg-[#F2F2F7]';
  const cardBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white';

  return (
    <div className={`min-h-screen ${bgClass} animate-slide-left pb-safe-bottom`}>
       <NavBar 
        title="" 
        theme={theme} 
        leftIcon={<ChevronLeft size={32} strokeWidth={2.5} className={theme === 'dark' ? "text-white" : "text-black"} />}
        rightIcon={<Share2 size={24} className="text-gray-400" />}
        onLeftClick={onBack}
        className="bg-transparent"
      />
      
      {/* Header Profile */}
      <div className="pt-20 px-6 flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full p-1 border-2 border-yellow-500 mb-4">
          <img src={user?.avatar || 'https://picsum.photos/100/100'} className="w-full h-full rounded-full" alt="profile" />
        </div>
        <h2 className={`text-2xl font-bold ${textColor} mb-1`}>{user?.name || 'User'}</h2>
        <p className={`text-sm ${subTextColor} text-center max-w-[200px]`}>
          {t.bio_mock}
        </p>
        <button className="mt-4 bg-black dark:bg-white text-white dark:text-black px-8 py-2 rounded-full text-sm font-bold">
          {t.follow}
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-around px-8 mb-8">
        <div className="text-center">
          <div className={`text-xl font-bold ${textColor}`}>142</div>
          <div className={`text-xs ${subTextColor}`}>{t.dishes_count}</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${textColor}`}>12</div>
          <div className={`text-xs ${subTextColor}`}>{t.cuisine_count}</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold ${textColor}`}>5.8k</div>
          <div className={`text-xs ${subTextColor}`}>{t.likes}</div>
        </div>
      </div>

      {/* Gallery / Content */}
      <div className={`rounded-t-3xl ${cardBg} min-h-[500px] p-4`}>
        <h3 className={`font-bold ${textColor} mb-4 px-2`}>{t.recent_collection}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="aspect-square rounded-xl bg-gray-200 overflow-hidden relative">
               <img src={`https://picsum.photos/300/300?food=${i * 10 + user.id}`} className="w-full h-full object-cover" alt="food" />
               <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                 {t.healthy}
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};