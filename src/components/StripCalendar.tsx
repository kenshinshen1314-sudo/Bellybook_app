import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { Language, Theme } from '../types';

interface StripCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    lang: Language;
    theme: Theme;
}

export const StripCalendar: React.FC<StripCalendarProps> = ({
    selectedDate,
    onDateSelect,
    lang,
    theme,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const styles = useThemeStyles(theme);

    // Background color for selected date
    const selectedBgColor = theme === 'dark'
        ? 'bg-gradient-to-br from-orange-500 to-red-500'
        : 'bg-gradient-to-br from-orange-400 to-red-400';
    const selectedShadow = theme === 'dark'
        ? 'shadow-lg shadow-orange-500/30'
        : 'shadow-md shadow-orange-400/40';

    // Weekly days generation
    // We'll generate a 3 arrays of 7 days: Previous week, Current week, Next week
    // But for simplicity in this version, let's just show a 2-week window centered on "today" or "selectedDate"
    // Actually, the request image shows a clean single week row. Let's do a scrolling strip of ±14 days from selected Date.

    const generateDays = () => {
        const days = [];
        // Calculate Monday of the selected date's week
        const currentDay = selectedDate.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(selectedDate);
        monday.setDate(selectedDate.getDate() - distanceToMonday);
        monday.setHours(0, 0, 0, 0);

        // Generate 7 days from Monday to Sunday
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            days.push(date);
        }
        return days;
    };

    // Days of week text
    const getDayText = (date: Date) => {
        const daysZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const daysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return lang === Language.ZH ? daysZH[date.getDay()] : daysEN[date.getDay()];
    };

    const days = generateDays();

    return (
        <div className="w-full">
            <div className="flex justify-between items-center px-2 py-4">
                {days.map((date, index) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center cursor-pointer"
                            onClick={() => onDateSelect(date)}
                        >
                            {/* Day Name (e.g. Mon) */}
                            <span className={`text-xs ${isSelected ? 'text-orange-500 font-bold' : styles.textSecondary} font-medium mb-1`}>
                                {getDayText(date)}
                            </span>

                            {/* Date Number with Background Highlight */}
                            <motion.div
                                className={`
                                    flex items-center justify-center
                                    w-12 h-12 rounded-2xl
                                    transition-all duration-200
                                    ${isSelected ? selectedBgColor + ' ' + selectedShadow : ''}
                                `}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className={`text-lg font-bold ${isSelected ? 'text-white' : styles.textSecondary}`}>
                                    {date.getDate()}
                                </span>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
