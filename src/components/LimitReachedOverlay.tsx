import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Language } from '../types';
import { DAILY_ANALYSIS_LIMIT } from '../config';

interface LimitReachedOverlayProps {
    onDismiss: () => void;
    lang: Language;
}

export const LimitReachedOverlay: React.FC<LimitReachedOverlayProps> = ({ onDismiss, lang }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            onClick={onDismiss}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#1C1C1E] rounded-3xl overflow-hidden w-full max-w-[320px] shadow-2xl relative cursor-pointer group"
                onClick={onDismiss}
            >
                <div className="relative h-80">
                    <img
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop"
                        alt="Limit Reached"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1C1C1E] opacity-90"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center pb-10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-3">
                            {lang === Language.ZH ? '今日分析次数已用完' : 'Daily Limit Reached'}
                        </h2>
                        <p className="text-xs text-gray-300 leading-relaxed font-medium opacity-90">
                            {lang === Language.ZH
                                ? `免费用户每天可分析${DAILY_ANALYSIS_LIMIT}餐，升级会员无限分析，尽情解锁你的美食经纬`
                                : `Free users can analyze ${DAILY_ANALYSIS_LIMIT} meals per day. Upgrade for unlimited access and unlock your gourmet journey.`}
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
