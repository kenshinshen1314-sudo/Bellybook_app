import React from 'react';
import { ChevronLeft, Home, BarChart2, Compass, Users, Plus, X, Lock, Check, ChevronRight, Book } from 'lucide-react';
import { Language, TEXT, Theme } from '../types';

// --- Base Components ---

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void;
  theme: Theme;
}> = ({ children, className = '', onClick, theme }) => {
  const bgClass = theme === 'dark' ? 'bg-[#1C1C1E] border-white/5' : 'bg-white border-black/5';
  return (
    <div onClick={onClick} className={`${bgClass} border rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const Button: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gold';
  className?: string;
  fullWidth?: boolean;
  theme?: Theme;
}> = ({ children, onClick, variant = 'primary', className = '', fullWidth = false, theme = 'light' }) => {
  const baseStyle = "font-semibold py-3 px-6 rounded-full transition-all active:scale-95 flex items-center justify-center";
  
  const variants = {
    primary: theme === 'dark' ? "bg-white text-black" : "bg-black text-white",
    secondary: theme === 'dark' ? "bg-[#2C2C2E] text-white" : "bg-gray-100 text-black",
    outline: theme === 'dark' ? "bg-transparent border-2 border-white/20 text-white" : "bg-transparent border-2 border-black/20 text-black",
    danger: "bg-red-500/10 text-red-500",
    gold: "bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-yellow-500/20 shadow-lg"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// --- Navigation ---

export const TabBar: React.FC<{ 
  activeTab: number; 
  onTabChange: (idx: number) => void; 
  onCameraClick: () => void;
  lang: Language;
  theme: Theme;
}> = ({ activeTab, onTabChange, onCameraClick, lang, theme }) => {
  const t = TEXT[lang];
  // Tabs configuration - Now 4 tabs: Home, Passport, Data, Social
  const tabs = [
    { icon: <Home size={24} />, label: t.tab_home },
    { icon: <Book size={24} />, label: t.tab_passport },
    { icon: <BarChart2 size={24} />, label: t.tab_data },
    { icon: <Users size={24} />, label: t.tab_social },
  ];

  const bgClass = theme === 'dark' ? 'bg-[#1C1C1E]/90 border-white/10' : 'bg-white/90 border-black/5';
  const textActive = theme === 'dark' ? 'text-white' : 'text-black';
  const textInactive = 'text-gray-500';

  return (
    <div className={`fixed bottom-0 left-0 right-0 h-[84px] ${bgClass} backdrop-blur-lg border-t flex items-start pt-3 justify-around z-50 safe-bottom`}>
      {tabs.map((tab, idx) => {
        // Render Camera Button before the 3rd tab (index 2 - Data)
        // This makes the layout: [Home] [Passport] [Camera] [Data] [Social]
        if (idx === 2) {
          return (
            <React.Fragment key="camera-group">
               <button 
                onClick={onCameraClick}
                className={`w-14 h-14 ${theme === 'dark' ? 'bg-white' : 'bg-black'} rounded-full flex items-center justify-center -mt-6 shadow-lg active:scale-95 transition-transform`}
              >
                <Plus size={32} className={theme === 'dark' ? 'text-black' : 'text-white'} />
              </button>
              <button 
                key={idx}
                onClick={() => onTabChange(idx)}
                className={`flex flex-col items-center justify-center w-16 transition-colors ${activeTab === idx ? textActive : textInactive}`}
              >
                {tab.icon}
                <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
              </button>
            </React.Fragment>
          );
        }
        return (
          <button 
            key={idx}
            onClick={() => onTabChange(idx)}
            className={`flex flex-col items-center justify-center w-16 transition-colors ${activeTab === idx ? textActive : textInactive}`}
          >
            {tab.icon}
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const NavBar: React.FC<{ 
  title?: string; 
  leftIcon?: React.ReactNode; 
  rightIcon?: React.ReactNode;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  className?: string;
  theme: Theme;
}> = ({ title, leftIcon, rightIcon, onLeftClick, onRightClick, className = '', theme }) => {
  const textClass = theme === 'dark' ? 'text-white' : 'text-black';
  return (
    <div className={`fixed top-0 left-0 right-0 h-[44px] mt-safe-top z-40 flex items-center justify-between px-4 ${className}`}>
      <div className="w-20 flex justify-start" onClick={onLeftClick}>
        {leftIcon}
      </div>
      <div className={`${textClass} font-semibold text-lg truncate`}>{title}</div>
      <div className="w-20 flex justify-end" onClick={onRightClick}>
        {rightIcon}
      </div>
    </div>
  );
};

// --- Content Blocks ---

export const LockedOverlay: React.FC<{ 
  title: string; 
  btnText: string; 
  onUnlock: () => void; 
}> = ({ title, btnText, onUnlock }) => (
  <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-10 text-center px-6">
    <Lock className="text-white/50 mb-4" size={32} />
    <h3 className="text-white/80 text-sm mb-6">{title}</h3>
    <Button variant="gold" onClick={onUnlock} className="px-8 py-2 text-sm h-10 min-h-0">
      {btnText}
    </Button>
  </div>
);

export const ListItem: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value?: string | React.ReactNode;
  onClick?: () => void;
  hasArrow?: boolean;
  theme: Theme;
}> = ({ icon, label, value, onClick, hasArrow = true, theme }) => {
  const bgClass = theme === 'dark' ? 'bg-[#1C1C1E] border-white/5 active:bg-[#2C2C2E]' : 'bg-white border-black/5 active:bg-gray-50';
  const textClass = theme === 'dark' ? 'text-white' : 'text-black';

  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between py-4 px-4 ${bgClass} border-b transition-colors first:rounded-t-xl last:rounded-b-xl last:border-0`}
    >
      <div className="flex items-center">
        {icon && <span className="mr-3 text-gray-400">{icon}</span>}
        <span className={`${textClass} font-medium`}>{label}</span>
      </div>
      <div className="flex items-center text-gray-400">
        <span className="mr-2 text-sm">{value}</span>
        {hasArrow && <ChevronRight size={16} />}
      </div>
    </div>
  );
};

export const ToggleItem: React.FC<{
  label: string;
  subLabel?: string;
  checked: boolean;
  onToggle: () => void;
  theme: Theme;
}> = ({ label, subLabel, checked, onToggle, theme }) => {
  const bgClass = theme === 'dark' ? 'bg-[#1C1C1E] border-white/5' : 'bg-white border-black/5';
  const textClass = theme === 'dark' ? 'text-white' : 'text-black';
  
  return (
    <div className={`flex items-center justify-between py-4 px-4 ${bgClass} first:rounded-t-xl last:rounded-b-xl border-b last:border-0`}>
      <div className="flex flex-col">
        <span className={`${textClass} font-medium`}>{label}</span>
        {subLabel && <span className="text-xs text-gray-500 mt-1">{subLabel}</span>}
      </div>
      <div 
        onClick={onToggle}
        className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${checked ? 'bg-green-500' : 'bg-[#3A3A3C]'}`}
      >
        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  );
};