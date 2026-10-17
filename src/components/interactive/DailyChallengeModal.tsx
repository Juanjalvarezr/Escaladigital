import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';
import { ConfettiCelebration } from '../ui/ConfettiCelebration';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({ isOpen, onClose }) => {
  const {
    streakDays,
    dailyChallengeCompleted,
    flashcards,
    completeDailyChallenge,
    reviewFlashcard,
    addXp
  } = useLearningStore();

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const currentCard = flashcards[0];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && isOpen && !dailyChallengeCompleted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isOpen, dailyChallengeCompleted]);

  // Start timer when modal opens
  useEffect(() => {
    if (isOpen && !dailyChallengeCompleted && !selectedIdx) {
      setIsTimerRunning(true);
      setTimer(0);
    }
  }, [isOpen, dailyChallengeCompleted, selectedIdx]);

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null || !currentCard) return;
    
    setIsTimerRunning(false);
    setSelectedIdx(idx);
    
    const isCorrect = idx === currentCard.correctIndex;
    reviewFlashcard(currentCard.id, isCorrect);
    completeDailyChallenge();

    // Calculate XP based on time and correctness
    let xp = 0;
    if (isCorrect) {
      const timeBonus = Math.max(0, 30 - timer); // Bonus for fast answers
      xp = 50 + timeBonus;
      setShowConfetti(true);
    } else {
      xp = 10; // Small XP for trying
    }
    
    setXpGained(xp);
    addXp(xp, isCorrect ? 'Reto del día acertado' : 'Reto del día intentado');

    // Auto-close after showing explanation
    setTimeout(() => {
      setShowConfetti(false);
      onClose();
    }, 3500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (dailyChallengeCompleted) return null;
  if (!currentCard) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-gradient-to-br from-dark-secondary via-dark-tertiary to-dark-bg border border-violet/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(139,92,246,0.3)] max-w-lg w-full pointer-events-auto relative overflow-hidden">
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-dark-bg/50 hover:bg-dark-bg/80 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                >
                  ✕
                </button>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet to-electric-blue flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                      ⚡
                    </div>
                    <div>
                      <span className="text-xs font-bold text-violet uppercase tracking-wider bg-violet/20 px-2 py-0.5 rounded-full border border-violet/30">
                        Desafío del Día
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {selectedIdx !== null ? (selectedIdx === currentCard.correctIndex ? '¡Excelente!' : 'Sigue practicando') : '¿Cuánto recuerdas?'}
                      </h3>
                    </div>
                  </div>

                  {/* Timer & Streak */}
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center space-x-1.5 bg-dark-bg/80 px-3 py-1.5 rounded-full border border-gray-700">
                      <span className="text-amber-400 font-bold text-sm">🔥 {streakDays}</span>
                      <span className="text-xs text-gray-400">racha</span>
                    </div>
                    {selectedIdx === null && (
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{formatTime(timer)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question */}
                <div className="bg-dark-bg/60 border border-gray-700/60 rounded-2xl p-5 mb-5 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet to-electric-blue rounded-l-2xl"></div>
                  <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed">
                    "{currentCard.question}"
                  </p>
                </div>

                {/* Options */}
                {currentCard.options && selectedIdx === null && (
                  <div className="space-y-3 mb-4">
                    {currentCard.options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(idx)}
                        className="w-full text-left p-4 rounded-xl border border-gray-700 hover:border-violet/60 bg-dark-bg/40 hover:bg-dark-bg/60 text-gray-300 transition-all flex items-center space-x-3 group"
                      >
                        <span className="w-8 h-8 rounded-lg border border-gray-600 group-hover:border-violet/60 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:text-violet flex-shrink-0 transition-all">
                          {idx + 1}
                        </span>
                        <span className="text-sm">{option}</span>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Results */}
                {selectedIdx !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Result Cards */}
                    {currentCard.options?.map((option, idx) => {
                      let style = 'border-gray-800 bg-dark-bg/30 text-gray-500';
                      let icon = '';

                      if (idx === currentCard.correctIndex) {
                        style = 'border-emerald-500 bg-emerald-500/20 text-emerald-200';
                        icon = '✓';
                      } else if (idx === selectedIdx && idx !== currentCard.correctIndex) {
                        style = 'border-red-500 bg-red-500/20 text-red-200';
                        icon = '✗';
                      }

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border ${style} flex items-center space-x-3`}
                        >
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {icon || idx + 1}
                          </span>
                          <span className="text-sm">{option}</span>
                        </div>
                      );
                    })}

                    {/* Explanation */}
                    <div className="bg-dark-bg/90 border border-gray-700 p-4 rounded-xl">
                      <div className="font-bold text-emerald-400 mb-2 flex items-center space-x-2">
                        <span>💡</span>
                        <span>Punto clave:</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {currentCard.explanation}
                      </p>
                    </div>

                    {/* XP Gained */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-3"
                    >
                      <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                        +{xpGained} XP
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {selectedIdx === currentCard.correctIndex ? '¡Respuesta correcta!' : 'Sigue practicando para mejorar'}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confetti Celebration */}
      <ConfettiCelebration
        trigger={showConfetti}
        message="¡Desafío Completado!"
        submessage={`+${xpGained} XP sumados a tu perfil`}
      />
    </>
  );
};

export default DailyChallengeModal;
