import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';

export const BadgeNotification: React.FC = () => {
  const { newlyUnlockedBadge, clearNewBadge } = useLearningStore();

  useEffect(() => {
    if (!newlyUnlockedBadge) return;
    const timer = setTimeout(clearNewBadge, 4500);
    return () => clearTimeout(timer);
  }, [newlyUnlockedBadge, clearNewBadge]);

  return (
    <AnimatePresence>
      {newlyUnlockedBadge && (
        <motion.div
          initial={{ y: -120, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -120, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] pointer-events-none"
        >
          <div className="relative flex items-center space-x-4 bg-gradient-to-r from-amber-500/20 via-dark-secondary to-amber-500/20 border border-amber-400/50 rounded-2xl px-6 py-4 shadow-2xl">
            {/* Glow */}
            <div className="absolute inset-0 bg-amber-400/10 rounded-2xl blur-md pointer-events-none" />

            {/* Badge Icon */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl relative z-10"
            >
              {newlyUnlockedBadge.emoji}
            </motion.div>

            {/* Text */}
            <div className="relative z-10">
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-0.5">
                🏅 ¡Insignia Desbloqueada!
              </div>
              <div className="text-base font-black text-white">
                {newlyUnlockedBadge.name}
              </div>
              <div className="text-xs text-gray-300 mt-0.5">
                {newlyUnlockedBadge.description}
              </div>
            </div>

            {/* +150 XP pill */}
            <div className="relative z-10 bg-amber-400/20 border border-amber-400/40 rounded-xl px-3 py-1.5 text-center">
              <div className="text-xs font-black text-amber-300">+150</div>
              <div className="text-[9px] text-amber-400 font-bold">XP</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
