import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, LockedOverlay } from '../../components/UIComponents';
import { Language, TEXT, Theme } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Apple, Beef, Wheat, Carrot, Sun, CloudSun, Moon, Coffee, Plus } from 'lucide-react';

interface Tab2HistoryProps {
  lang: Language;
  isPremium: boolean;
  onUpgrade: () => void;
  theme: Theme;
}

const regularityData = [
  { x: 1, y: 8, z: 100 },  { x: 1, y: 13, z: 100 }, { x: 1, y: 19, z: 100 },
  { x: 2, y: 8.5, z: 100 }, { x: 2, y: 12.5, z: 100 }, { x: 2, y: 19.5, z: 100 },
  { x: 3, y: 7.5, z: 100 }, { x: 3, y: 13, z: 100 }, { x: 3, y: 18.5, z: 100 },
  { x: 4, y: 8, z: 100 },   { x: 4, y: 12, z: 100 },  { x: 4, y: 20, z: 100 },
  { x: 5, y: 9, z: 100 },   { x: 5, y: 13.5, z: 100 }, { x: 5, y: 19, z: 100 },
  { x: 6, y: 8.5, z: 100 }, { x: 6, y: 13, z: 100 }, { x: 6, y: 19.5, z: 100 },
  { x: 7, y: 8, z: 100 },   { x: 7, y: 12.5, z: 100 }, { x: 7, y: 19, z: 100 },
];

// Helper to calculate bubble diameter
// Adjusted: Reduced scaleFactor further to 3.5 for smaller bubbles
const getBubbleSize = (value: number, minSize = 28, scaleFactor = 3.5) => {
    // Area ~ Value => Radius ~ Sqrt(Value)
    const size = Math.sqrt(value) * scaleFactor;
    return Math.max(minSize, size); // Ensure minimum visibility
};

const Tab2History: React.FC<Tab2HistoryProps> = ({ lang, isPremium, onUpgrade, theme }) => {
  const t = TEXT[lang];
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const axisColor = theme === 'dark' ? '#555' : '#ddd';
  const tooltipBg = theme === 'dark' ? '#333' : '#fff';
  const tooltipColor = theme === 'dark' ? '#fff' : '#000';

  // Refs for Physics Simulation
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<number>(0);
  
  // Physics state (x, y, vx, vy, radius)
  const physicsState = useRef<{
      x: number; y: number; vx: number; vy: number; r: number; id: string
  }[]>([]);

  // Generate current week data (Monday to Sunday)
  const trendData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sun) - 6 (Sat)
    
    // Calculate Monday of the current week
    // If today is Sunday (0), Monday was 6 days ago. If Mon (1), it's 0 days ago.
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      
      // Create a somewhat deterministic random calorie count based on date
      const seed = d.getDate() + d.getMonth() * 30 + d.getFullYear(); 
      const pseudoRandom = Math.sin(seed) * 10000;
      const randomFactor = pseudoRandom - Math.floor(pseudoRandom);
      const cal = 1600 + Math.floor(randomFactor * 800); 
      
      data.push({
        day: days[d.getDay()],
        date: d.getDate(),
        cal: cal,
        isToday: d.toDateString() === new Date().toDateString()
      });
    }
    return data;
  }, []);

  // Initialize selected day to Today's index
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
      const idx = trendData.findIndex(d => d.isToday);
      return idx !== -1 ? idx : 0;
  });

  // Calculate stats based on selected day
  const dailyStats = useMemo(() => {
    const dayData = trendData[selectedDayIndex];
    const totalCal = dayData.cal;
    
    // Vary macros slightly based on index to simulate real data changes
    const carbPct = 40 + (selectedDayIndex % 3) * 5;
    const fatPct = 30 - (selectedDayIndex % 2) * 5;
    const protPct = 100 - carbPct - fatPct;
    
    // Approximate grams based on calories (4 cal/g for Carbs/Protein, 9 cal/g for Fat)
    const carbGrams = Math.round((totalCal * (carbPct / 100)) / 4);
    const fatGrams = Math.round((totalCal * (fatPct / 100)) / 9);
    const proteinGrams = Math.round((totalCal * (protPct / 100)) / 4);
    // Mock Vitamin Value (arbitrary score 0-100)
    const vitaminScore = 50 + (selectedDayIndex * 7) % 50;

    return {
        totalCal,
        grams: {
            carbs: carbGrams,
            fat: fatGrams,
            protein: proteinGrams,
            vitamin: vitaminScore
        },
        meals: [
             { label: t.breakfast, icon: <Sun size={20} />, color: 'bg-orange-100 text-orange-600', cal: Math.round(totalCal * 0.25) },
             { label: t.lunch, icon: <CloudSun size={20} />, color: 'bg-yellow-100 text-yellow-600', cal: Math.round(totalCal * 0.35) },
             { label: t.dinner, icon: <Moon size={20} />, color: 'bg-indigo-100 text-indigo-600', cal: Math.round(totalCal * 0.30) },
             { label: t.snack, icon: <Coffee size={20} />, color: 'bg-pink-100 text-pink-600', cal: Math.round(totalCal * 0.10) },
        ]
    };
  }, [selectedDayIndex, trendData, t]);

  const cuisineKeys = ['cuisine_japanese', 'cuisine_cantonese', 'cuisine_italian', 'cuisine_korean', 'cuisine_new_world', 'cuisine_french'];

  // Combined Simulation Data (Total Calories + Macros)
  const simulationItems = useMemo(() => {
    const items = [];
    
    // 1. Total Calories Bubble (The largest one)
    items.push({
        id: 'total-cal',
        type: 'total',
        val: dailyStats.totalCal,
        unit: 'cal',
        label: '',
        color: theme === 'dark' ? '#2C2C2E' : '#F3F4F6',
        textColor: theme === 'dark' ? '#FFFFFF' : '#000000',
        radius: 50 // Fixed radius 50 (Diameter 100)
    });

    // 2. Macro Bubbles
    const macros = [
        { key: 'protein', label: t.macro_protein, val: dailyStats.grams.protein, unit: 'g', color: '#E85D75' },
        { key: 'carbs', label: t.macro_carbs, val: dailyStats.grams.carbs, unit: 'g', color: '#D2E603' },
        { key: 'fat', label: t.macro_fat, val: dailyStats.grams.fat, unit: 'g', color: '#FF6B6B' },
        { key: 'vitamin', label: t.macro_vitamin, val: dailyStats.grams.vitamin, unit: '%', color: '#4FD1C5' },
    ];

    macros.forEach(b => {
        const size = getBubbleSize(b.val);
        items.push({
            id: b.key,
            type: 'macro',
            val: b.val,
            unit: b.unit,
            label: b.label,
            color: b.color,
            textColor: b.key === 'carbs' ? 'black' : 'white',
            radius: size / 2
        });
    });

    return items;
  }, [dailyStats, t, theme]);

  // Physics Effect
  useEffect(() => {
    if (!containerRef.current) return;

    let { width, height } = containerRef.current.getBoundingClientRect();
    
    // Safety check for unmounted or hidden
    if (width === 0) width = 300; 
    if (height === 0) height = 288;

    // Initialize State
    physicsState.current = simulationItems.map((item) => {
        const r = item.radius;
        const padding = 2;
        
        // Random position within strict bounds
        const maxX = width - r - padding;
        const minX = r + padding;
        const maxY = height - r - padding;
        const minY = r + padding;

        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);

        return {
            id: item.id,
            r: r,
            x: x, 
            y: y,
            vx: (Math.random() - 0.5) * 1.0, // Reduced speed for smoother visual
            vy: (Math.random() - 0.5) * 1.0
        };
    });

    const update = () => {
        const state = physicsState.current;
        const speedLimit = 1.5;

        // 1. Update Position
        state.forEach(b => {
            b.x += b.vx;
            b.y += b.vy;
        });

        // 2. Resolve Collisions
        
        // Walls - STRICT CLAMPING
        state.forEach(b => {
            // Left Wall
            if (b.x - b.r < 0) { 
                b.x = b.r; // Clamp
                b.vx = Math.abs(b.vx); // Bounce Right
            }
            // Right Wall
            if (b.x + b.r > width) { 
                b.x = width - b.r; // Clamp
                b.vx = -Math.abs(b.vx); // Bounce Left
            }
            // Top Wall
            if (b.y - b.r < 0) { 
                b.y = b.r; // Clamp
                b.vy = Math.abs(b.vy); // Bounce Down
            }
            // Bottom Wall
            if (b.y + b.r > height) { 
                b.y = height - b.r; // Clamp
                b.vy = -Math.abs(b.vy); // Bounce Up
            }
        });

        // Bubble-Bubble Collision (All Pairs)
        for (let i = 0; i < state.length; i++) {
            for (let j = i + 1; j < state.length; j++) {
                const b1 = state[i];
                const b2 = state[j];
                
                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const minDist = b1.r + b2.r;
                
                if (dist < minDist) {
                    // Normalize collision normal
                    const nx = dx / dist || 0;
                    const ny = dy / dist || 0;
                    
                    // Overlap
                    const overlap = minDist - dist;
                    
                    // Separate (Push apart proportional to mass/radius? Simply equal for now)
                    const moveX = nx * overlap * 0.5;
                    const moveY = ny * overlap * 0.5;
                    
                    // Apply position correction immediately to prevent sticking
                    b1.x -= moveX;
                    b1.y -= moveY;
                    b2.x += moveX;
                    b2.y += moveY;
                    
                    // Velocity reflection (Simple 1D elastic)
                    const v1n = b1.vx * nx + b1.vy * ny;
                    const v2n = b2.vx * nx + b2.vy * ny;
                    
                    // Swap normal velocities
                    b1.vx -= (v1n - v2n) * nx;
                    b1.vy -= (v1n - v2n) * ny;
                    b2.vx += (v1n - v2n) * nx;
                    b2.vy += (v1n - v2n) * ny;
                    
                    // Cap speeds
                    b1.vx = Math.max(Math.min(b1.vx, speedLimit), -speedLimit);
                    b1.vy = Math.max(Math.min(b1.vy, speedLimit), -speedLimit);
                    b2.vx = Math.max(Math.min(b2.vx, speedLimit), -speedLimit);
                    b2.vy = Math.max(Math.min(b2.vy, speedLimit), -speedLimit);
                }
            }
        }

        // 3. Render
        state.forEach((b, i) => {
            const el = bubbleRefs.current[i];
            if (el) {
                // translate(x - r, y - r) to position top-left based on center (x,y)
                el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`;
            }
        });

        animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  }, [simulationItems]); // Restart when data changes

  return (
    <div className={`pb-28 pt-24 px-4 animate-fade-in ${textColor} space-y-6`}>
      
      {/* 1. Interactive Calendar Header */}
      <div className="flex justify-between px-2 mb-2 text-xs text-gray-500 text-center">
        {trendData.map((d, i) => (
           <div 
             key={i} 
             onClick={() => setSelectedDayIndex(i)}
             className={`w-8 cursor-pointer transition-all active:scale-95 ${selectedDayIndex === i ? `${textColor} font-bold` : 'opacity-70'}`}
           >
             <div className="mb-1">{d.day}</div>
             <div className={`text-base ${selectedDayIndex === i ? textColor : ''}`}>{d.date}</div>
             {/* Indicator Dot */}
             <div className={`w-1 h-1 rounded-full mx-auto mt-1 transition-colors ${selectedDayIndex === i ? 'bg-red-500' : 'bg-transparent'}`}></div>
           </div>
        ))}
      </div>

      {/* 2. Macro Bubble Chart (Physics Based) */}
      <Card theme={theme} className="p-6 h-72 relative flex items-center justify-center overflow-hidden">
        {/* Container for the physics simulation */}
        <div ref={containerRef} className="relative w-full h-full mx-auto">
             {/* Simulation Items */}
             {simulationItems.map((item, i) => (
                <div 
                    key={item.id}
                    ref={(el) => { bubbleRefs.current[i] = el; }}
                    className="absolute top-0 left-0 rounded-full flex flex-col items-center justify-center shadow-lg z-20 will-change-transform"
                    style={{
                        width: `${item.radius * 2}px`,
                        height: `${item.radius * 2}px`,
                        backgroundColor: item.color,
                        color: item.textColor,
                    }}
                >
                    {item.type === 'total' ? (
                        <>
                           <span className="text-2xl font-bold leading-none">{item.val}</span>
                           <span className="text-xs font-normal opacity-70 leading-none mt-1">{item.unit}</span>
                        </>
                    ) : (
                        <span className="text-xs font-bold">{item.val}{item.unit}</span>
                    )}
                </div>
             ))}
        </div>
        
        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-3 text-[10px] font-medium flex-wrap z-30 pointer-events-none">
           {simulationItems.filter(i => i.type === 'macro').map(b => (
               <div key={b.id} className="flex items-center mx-1 my-1">
                   <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: b.color }}></div>
                   {b.label}
               </div>
           ))}
        </div>
      </Card>

      {/* 2.5. Daily Meals (Dynamic) */}
      <div className="space-y-3">
        <h2 className={`text-xl font-bold ${textColor}`}>{t.todays_meals}</h2>
        <div className="grid grid-cols-2 gap-3">
          {dailyStats.meals.map((meal, i) => (
             <Card theme={theme} key={i} className={`p-4 flex flex-col justify-between h-28 ${theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                   <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : meal.color}`}>
                      {meal.icon}
                   </div>
                   <button className={`w-6 h-6 rounded-full border border-dashed ${theme === 'dark' ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-400'} flex items-center justify-center`}>
                      <Plus size={14} />
                   </button>
                </div>
                <div>
                   <div className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{meal.label}</div>
                   <div className="text-xs text-gray-500 mt-1 transition-all">{meal.cal} cal</div>
                </div>
             </Card>
          ))}
        </div>
      </div>

      {/* 3. Cuisine Explorer (Static for now) */}
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

      {/* 4. Nutrient Trends (Highlight Active Day) */}
      <div className="space-y-3 relative">
        <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold">{t.nutrient_trends}</h2>
            <span className="text-xs text-gray-500">{t.details} &gt;</span>
        </div>
        <Card theme={theme} className="p-4 h-64 relative overflow-hidden">
           <div>
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
                   <Line 
                    type="monotone" 
                    dataKey="cal" 
                    stroke={theme === 'dark' ? "#E5E7EB" : "#333"} 
                    strokeWidth={2} 
                    dot={(props) => {
                        const { cx, cy, index } = props;
                        const isActive = index === selectedDayIndex;
                        return (
                            <circle 
                                key={index} 
                                cx={cx} 
                                cy={cy} 
                                r={isActive ? 6 : 3} 
                                fill={isActive ? '#E85D75' : (theme === 'dark' ? '#E5E7EB' : '#333')} 
                                strokeWidth={0}
                            />
                        );
                    }}
                   />
                 </LineChart>
               </ResponsiveContainer>
           </div>
        </Card>
      </div>

      {/* 5. Meal Regularity (Static) */}
      <div className="space-y-3 relative">
        <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold">{t.meal_regularity}</h2>
            <span className="text-xs text-gray-500">72 {t.points} &gt;</span>
        </div>
        <Card theme={theme} className="p-4 h-48 relative overflow-hidden">
            <div className='h-full'>
                <div className="absolute right-4 top-4 text-xs text-gray-500 flex flex-col space-y-4 text-right z-0">
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
            </div>
        </Card>
      </div>

      {/* 6. Food Diversity (Static) */}
      <div className="space-y-3 relative">
        <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold">{t.food_diversity}</h2>
            <span className="text-xs text-gray-500">86 {t.points} &gt;</span>
        </div>
        <Card theme={theme} className="p-4 relative overflow-hidden">
            <div>
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
            </div>
        </Card>
      </div>

    </div>
  );
};

export default Tab2History;