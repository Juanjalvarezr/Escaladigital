import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';

interface LessonCompletionScreenProps {
  show: boolean;
  lessonTitle: string;
  areaId: string;
  moduleNumber: number;
  totalModules: number;
  nextLessonTitle?: string;
  onDone: () => void;
}

const AREA_EMOJIS: Record<string, string> = {
  finance: '💰',
  sales: '🎯',
  marketing: '📣',
  operations: '⚙️',
  management: '🧭',
  technology: '💻',
  legal: '⚖️',
  growth: '🚀',
};

export const LessonCompletionScreen: React.FC<LessonCompletionScreenProps> = ({
  show,
  lessonTitle,
  areaId,
  moduleNumber,
  totalModules,
  nextLessonTitle,
  onDone,
}) => {
  const { businessName, xp, businessLevel } = useLearningStore();
  const currentXpForBar = xp;
  const progressPct = Math.min(100, Math.round((currentXpForBar / businessLevel.nextLevelXp) * 100));
  const areaEmoji = AREA_EMOJIS[areaId] || '⚡';
  const displayName = businessName || 'tu negocio';

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [show, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 40 }}
            transition={{ type: 'spring', damping: 18, stiffness: 180 }}
            className="w-full max-w-sm bg-dark-secondary border border-gray-700 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Top banner */}
            <div className="bg-gradient-to-br from-emerald-500/20 via-electric-blue/10 to-dark-secondary p-6 pb-5 relative">
              <div className="absolute inset-0 bg-emerald-400/5 blur-2xl pointer-events-none" />

              {/* Animated check */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mx-auto mb-3 shadow-[0_0_24px_rgba(52,211,153,0.4)]"
              >
                ✓
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  🎯 LECCIÓN DOMINADA
                </div>
                <h2 className="text-xl font-black text-white mt-1 leading-tight">
                  {lessonTitle}
                </h2>
              </motion.div>
            </div>

            {/* Body */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 space-y-4"
            >
              {/* Applied to your business */}
              <div className="bg-dark-tertiary border border-gray-800 rounded-xl p-4 flex items-center space-x-3">
                <span className="text-2xl">{areaEmoji}</span>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Aplicado a
                  </div>
                  <div className="text-sm font-bold text-white capitalize">{displayName}</div>
                </div>
              </div>

              {/* XP + Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-violet">+100 XP ganados</span>
                  <span className="text-gray-400">{currentXpForBar} / {businessLevel.nextLevelXp} XP</span>
                </div>
                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: `${Math.max(0, progressPct - 10)}%` }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet to-electric-blue"
                  />
                </div>
                <div className="text-center text-[10px] text-gray-500">
                  Nivel: <strong className="text-violet">{businessLevel.title}</strong>
                </div>
              </div>

              {/* Module progress */}
              <div className="flex items-center justify-between bg-electric-blue/10 border border-electric-blue/20 rounded-xl p-3">
                <span className="text-xs text-gray-300">
                  Módulo <strong className="text-white">{moduleNumber}</strong> de {totalModules} completado
                </span>
                <span className="text-electric-blue text-sm">✦</span>
              </div>

              {/* Next lesson hint */}
              {nextLessonTitle && (
                <div className="text-center text-xs text-gray-500">
                  Siguiente: <span className="text-gray-300 font-semibold">{nextLessonTitle} →</span>
                </div>
              )}

              {/* Skip button */}
              <button
                onClick={onDone}
                className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Continuar ahora →
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
