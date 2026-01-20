/**
 * Time Picker Component
 * A stylish, interactive time picker with smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { Language, Theme } from '@/types';

interface TimePickerProps {
  value: string; // Format: "HH:mm"
  onChange: (value: string) => void;
  language: Language;
  theme: Theme;
}

export function TimePicker({ value, onChange, language, theme }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(() => parseInt(value.split(':')[0], 10));
  const [minutes, setMinutes] = useState(() => parseInt(value.split(':')[1], 10));
  const pickerRef = useRef<HTMLDivElement>(null);

  // Generate hours (0-23) and minutes (0-59) arrays
  const hoursArray = Array.from({ length: 24 }, (_, i) => i);
  const minutesArray = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, 15, ..., 55

  // Scroll to selected value
  useEffect(() => {
    if (isOpen) {
      const hourElement = document.getElementById(`hour-${hours}`);
      const minuteElement = document.getElementById(`minute-${minutes}`);

      hourElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      minuteElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen, hours, minutes]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHourSelect = (hour: number) => {
    setHours(hour);
    const minuteStr = minutes.toString().padStart(2, '0');
    const hourStr = hour.toString().padStart(2, '0');
    onChange(`${hourStr}:${minuteStr}`);
  };

  const handleMinuteSelect = (minute: number) => {
    setMinutes(minute);
    const minuteStr = minute.toString().padStart(2, '0');
    const hourStr = hours.toString().padStart(2, '0');
    onChange(`${hourStr}:${minuteStr}`);
  };

  const formatDisplayTime = (hour: number, minute: number) => {
    const hourStr = hour.toString().padStart(2, '0');
    const minuteStr = minute.toString().padStart(2, '0');
    return `${hourStr}:${minuteStr}`;
  };

  return (
    <div className="relative" ref={pickerRef}>
      {/* Time Display Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-4 rounded-xl border-2
          flex items-center justify-between
          transition-all duration-300
          ${isOpen
            ? theme === 'dark'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 shadow-lg shadow-amber-500/30'
              : 'bg-gradient-to-r from-amber-400 to-orange-400 border-amber-300 shadow-lg shadow-amber-400/30'
            : theme === 'dark'
              ? 'bg-[#2C2C2E] border-white/10 hover:border-amber-500/50'
              : 'bg-white border-gray-200 hover:border-amber-300'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${isOpen
              ? 'bg-white/20 backdrop-blur-sm'
              : theme === 'dark' ? 'bg-white/10' : 'bg-amber-100'
            }
          `}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" className="opacity-30"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="text-left">
            <div className={`text-xs ${isOpen ? 'text-white/80' : 'text-muted-foreground'}`}>
              {language === Language.ZH ? '提醒时间' : 'Reminder Time'}
            </div>
            <div className={`text-2xl font-bold ${isOpen ? 'text-white' : ''}`}>
              {formatDisplayTime(hours, minutes)}
            </div>
          </div>
        </div>
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300
          ${isOpen ? 'rotate-180' : ''}
        `}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </button>

      {/* Picker Modal */}
      {isOpen && (
        <div className={`
          absolute top-full left-0 right-0 mt-3 p-6 rounded-2xl
          backdrop-blur-xl border-2
          z-50 animate-in fade-in slide-in-from-top-2 duration-300
          ${theme === 'dark'
            ? 'bg-[#1C1C1E]/95 border-amber-500/30'
            : 'bg-white/95 border-amber-200'
          }
          shadow-2xl
        `}>
          <div className="flex gap-4">
            {/* Hours Column */}
            <div className="flex-1">
              <div className={`text-center text-xs mb-3 font-medium ${
                theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
              }`}>
                {language === Language.ZH ? '时' : 'Hour'}
              </div>
              <div className={`
                h-48 overflow-y-auto
                scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-transparent
                rounded-lg
                ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-100'}
              `}>
                {hoursArray.map((hour) => (
                  <div
                    key={hour}
                    id={`hour-${hour}`}
                    onClick={() => handleHourSelect(hour)}
                    className={`
                      py-3 px-4 my-1 rounded-lg cursor-pointer
                      transition-all duration-200
                      text-center text-lg font-medium
                      ${hours === hour
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105'
                          : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg scale-105'
                        : theme === 'dark'
                          ? 'hover:bg-white/10 text-gray-300'
                          : 'hover:bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex-1">
              <div className={`text-center text-xs mb-3 font-medium ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`}>
                {language === Language.ZH ? '分' : 'Minute'}
              </div>
              <div className={`
                h-48 overflow-y-auto
                scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-transparent
                rounded-lg
                ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-100'}
              `}>
                {minutesArray.map((minute) => (
                  <div
                    key={minute}
                    id={`minute-${minute}`}
                    onClick={() => handleMinuteSelect(minute)}
                    className={`
                      py-3 px-4 my-1 rounded-lg cursor-pointer
                      transition-all duration-200
                      text-center text-lg font-medium
                      ${minutes === minute
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                          : 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg scale-105'
                        : theme === 'dark'
                          ? 'hover:bg-white/10 text-gray-300'
                          : 'hover:bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Time Display */}
          <div className={`
            mt-4 p-4 rounded-xl text-center
            ${theme === 'dark'
              ? 'bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-500/30'
              : 'bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200'
            }
          `}>
            <div className={`text-sm mb-1 ${
              theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
            }`}>
              {language === Language.ZH ? '已选择' : 'Selected'}
            </div>
            <div className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {formatDisplayTime(hours, minutes)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
