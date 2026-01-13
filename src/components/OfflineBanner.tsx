import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineBannerProps {
  isOffline: boolean;
  className?: string;
}

export function OfflineBanner({ isOffline, className }: OfflineBannerProps) {
  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-[100] safe-top",
            "bg-amber-500 text-white",
            "px-4 py-3",
            "flex items-center justify-center gap-2",
            "shadow-lg",
            className
          )}
        >
          <WifiOff size={18} className="flex-shrink-0" />
          <span className="text-sm font-medium">
            离线模式 - 部分功能暂不可用
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
