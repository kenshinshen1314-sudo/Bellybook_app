import React from 'react';
import { Card } from '../../components/UIComponents';
import { Language, TEXT, Theme } from '../../types';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Apple, Beef, Wheat, Carrot } from 'lucide-react';

interface Tab3DiscoveryProps {
  lang: Language;
  isPremium: boolean;
  onUpgrade: () => void;
  theme: Theme;
}

// Mock Data for Charts
const trendData = [
  { day: '12/31', cal: 1800 },
  { day: '01/01', cal: 2100 },
  { day: '01/02', cal: 1950 },
  { day: '01/03', cal: 1700 },
  { day: '01/04', cal: 2300 },
  { day: '01/05', cal: 1850 },
  { day: '01/06', cal: 2000 },
];

const regularityData = [
  { x: 1, y: 8, z: 100 },  { x: 1, y: 13, z: 100 }, { x: 1, y: 19, z: 100 },
  { x: 2, y: 8.5, z: 100 }, { x: 2, y: 12.5, z: 100 }, { x: 2, y: 19.5, z: 100 },
  { x: 3, y: 7.5, z: 100 }, { x: 3, y: 13, z: 100 }, { x: 3, y: 18.5, z: 100 },
  { x: 4, y: 8, z: 100 },   { x: 4, y: 12, z: 100 },  { x: 4, y: 20, z: 100 },
  { x: 5, y: 9, z: 100 },   { x: 5, y: 13.5, z: 100 }, { x: 5, y: 19, z: 100 },
  { x: 6, y: 8.5, z: 100 }, { x: 6, y: 13, z: 100 }, { x: 6, y: 19.5, z: 100 },
  { x: 7, y: 8, z: 100 },   { x: 7, y: 12.5, z: 100 }, { x: 7, y: 19, z: 100 },
];

const Tab3Discovery: React.FC<Tab3DiscoveryProps> = ({ lang, theme }) => {
  const t = TEXT[lang];
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const axisColor = theme === 'dark' ? '#555' : '#ddd';
  const tooltipBg = theme === 'dark' ? '#333' : '#fff';
  const tooltipColor = theme === 'dark' ? '#fff' : '#000';

  const cuisineKeys = ['cuisine_japanese', 'cuisine_cantonese', 'cuisine_italian', 'cuisine_korean', 'cuisine_new_world', 'cuisine_french'];

  return (
    <div className={`pb-28 pt-24 px-4 animate-fade-in ${textColor} space-y-6`}>
      
      {/* 1. Cuisine Explorer */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
             <h2 className="text-xl font-bold">{t.cuisine_explorer}</h2>
             <span className="text-xs text-gray-500">6 {t.unit_cuisines} &gt;</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
           {cuisineKeys.slice(0, 4).map((cKey, i) => (
             <Card theme={theme} key={i} className={`h-28 flex items-end p-3 relative group ${theme === 'dark' ? 'bg-[#2C2C2E]' : 'bg-gray-100'}`}>
                <div className={`absolute inset-0 z-0 ${theme === 'dark' ? 'bg-gradient-to-t from-black/90 to-transparent' : 'bg-gradient-to-t from-black/50 to-transparent'}`}></div>
                <img src={`https://picsum.photos/200/200?food=${i+20}`} className="absolute inset-0 w-full h-full object-cover opacity-70 z-[-1]" alt={cKey} />
                <span className="relative z-10 font-medium text-sm text-white">{(t as any)[cKey]}</span>
                <span className="relative z-10 text-xs text-gray-300 ml-auto mb-0.5">{3 + i} {t.unit_dishes}</span>
             </Card>
           ))}
        </div>
      </div>

      {/* 2. Nutrient Trends */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold">{t.nutrient_trends}</h2>
            <span className="text-xs text-gray-500">{t.details} &gt;</span>
        </div>
        <Card theme={theme} className="p-4 h-64">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
               <XAxis 
                    dataKey="day" 
                    stroke={axisColor}
                    tick={{fill: '#888', fontSize: 10}} 
                    tickLine={false}
                    axisLine={false} 
                />
               <YAxis 
                    stroke={axisColor}
                    tick={{fill: '#888', fontSize: 10}} 
                    tickLine={false}
                    axisLine={false}
                />
               <Tooltip 
                    contentStyle={{ backgroundColor: tooltipBg, border: 'none', borderRadius: '8px', color: tooltipColor, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
               />
               <Line type="monotone" dataKey="cal" stroke={theme === 'dark' ? "#E5E7EB" : "#333"} strokeWidth={2} dot={{fill: theme === 'dark' ? '#E5E7EB' : '#333', r: 3}} activeDot={{r: 5}} />
             </LineChart>
           </ResponsiveContainer>
        </Card>
      </div>

      {/* 3. Meal Regularity */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold">{t.meal_regularity}</h2>
            <span className="text-xs text-gray-500">72 {t.points} &gt;</span>
        </div>
        <Card theme={theme} className="p-4 h-48 relative">
            <div className="absolute right-4 top-4 text-xs text-gray-500 flex flex-col space-y-4 text-right">
                <span>22:00</span>
                <span>18:00</span>
                <span>12:00</span>
                <span>6:00</span>
            </div>
            <ResponsiveContainer width="90%" height="100%">
                <ScatterChart margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
                    <XAxis type="number" dataKey="x" hide domain={[0, 8]} />
                    <YAxis type="number" dataKey="y" hide domain={[6, 24]} />
                    <ZAxis type="number" dataKey="z" range={[50, 50]} />
                    <Scatter name="Meals" data={regularityData} fill="#D2E603" shape="circle" />
                </ScatterChart>
            </ResponsiveContainer>
            <div className="flex justify-between px-2 text-[10px] text-gray-600 mt-[-10px] w-[90%]">
                 <span>12/31</span>
                 <span>01/01</span>
                 <span>01/02</span>
                 <span>01/03</span>
                 <span>01/04</span>
                 <span>01/05</span>
                 <span>01/06</span>
            </div>
        </Card>
      </div>

      {/* 4. Food Diversity */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold">{t.food_diversity}</h2>
            <span className="text-xs text-gray-500">86 {t.points} &gt;</span>
        </div>
        <Card theme={theme} className="p-4">
            <div className="flex items-center justify-between mb-4">
                 <div>
                    <div className={`text-2xl font-bold ${textColor}`}>22 <span className="text-sm font-normal text-gray-500">{t.food_items_count}</span></div>
                 </div>
                 <div className="flex items-center text-green-500 text-sm">
                    <span className="mr-1">⇧</span> +8 {t.this_week_increase}
                 </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                        <Apple size={20} className="text-red-400" />
                    </div>
                    <span className="text-[10px] text-gray-400">{t.fruits}</span>
                    <div className={`w-full h-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mt-1`}>
                        <div className="w-3/4 h-full bg-red-400 rounded-full"></div>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                        <Carrot size={20} className="text-orange-400" />
                    </div>
                    <span className="text-[10px] text-gray-400">{t.vegetables}</span>
                    <div className={`w-full h-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mt-1`}>
                        <div className="w-1/2 h-full bg-orange-400 rounded-full"></div>
                    </div>
                </div>
                 <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
                        <Wheat size={20} className="text-yellow-400" />
                    </div>
                    <span className="text-[10px] text-gray-400">{t.grains}</span>
                    <div className={`w-full h-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mt-1`}>
                        <div className="w-5/6 h-full bg-yellow-400 rounded-full"></div>
                    </div>
                </div>
                 <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                        <Beef size={20} className="text-blue-400" />
                    </div>
                    <span className="text-[10px] text-gray-400">{t.protein}</span>
                    <div className={`w-full h-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mt-1`}>
                        <div className="w-2/3 h-full bg-blue-400 rounded-full"></div>
                    </div>
                </div>
            </div>
        </Card>
      </div>

    </div>
  );
};

export default Tab3Discovery;