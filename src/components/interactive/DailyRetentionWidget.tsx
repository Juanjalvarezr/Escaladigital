import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';

export const DailyRetentionWidget: React.FC = () => {
  const {
    streakDays,
    dailyChallengeCompleted,
    flashcards,
    completeDailyChallenge,
    reviewFlashcard
  } = useLearningStore();

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Seleccionar la primera tarjeta disponible
  const currentCard = flashcards[0];

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null || !currentCard) return;
    setSelectedIdx(idx);
    setShowExplanation(true);
    const isCorrect = idx === currentCard.correctIndex;
    reviewFlashcard(currentCard.id, isCorrect);
    completeDailyChallenge();
  };

  if (dailyChallengeCompleted) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/40 to-dark-secondary border border-emerald-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
              ✅
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Reto Diario Cumplido
                </span>
                <span className="text-xs text-gray-400">• +50 XP ganados</span>
              </div>
              <h4 className="text-lg font-bold text-white mt-0.5">
                ¡Tu racha sigue ardiendo: {streakDays} días consecutivos! 🔥
              </h4>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs text-gray-400">Próximo repaso en</span>
            <div className="text-sm font-semibold text-gray-300">Mañana</div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="bg-gradient-to-br from-dark-secondary to-dark-tertiary border border-violet/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-violet/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl">⚡</span>
          <div>
            <span className="text-xs font-bold text-violet uppercase tracking-wider bg-violet/20 px-2 py-0.5 rounded-full border border-violet/30">
              Desafío de Retención del Día (2 min)
            </span>
            <h4 className="text-base font-bold text-white mt-0.5">Repetición Espaciada para Fijar Aprendizaje</h4>
          </div>
        </div>
        <div className="flex items-center space-x-1 bg-dark-bg/80 px-3 py-1.5 rounded-full border border-gray-700">
          <span className="text-amber-400 font-bold text-sm">🔥 {streakDays}</span>
          <span className="text-xs text-gray-400">días</span>
        </div>
      </div>

      <p className="text-sm text-gray-200 font-medium mb-4 bg-dark-bg/50 p-3.5 rounded-xl border border-gray-700/60">
        "{currentCard.question}"
      </p>

      {/* Opciones */}
      {currentCard.options && (
        <div className="space-y-2 mb-4">
          {currentCard.options.map((option, idx) => {
            let btnStyle = 'border-gray-700 hover:border-violet/60 bg-dark-bg/40 text-gray-300';
            
            if (selectedIdx !== null) {
              if (idx === currentCard.correctIndex) {
                btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-semibold';
              } else if (idx === selectedIdx) {
                btnStyle = 'border-red-500 bg-red-500/20 text-red-200';
              } else {
                btnStyle = 'opacity-40 border-gray-800 bg-dark-bg/20 text-gray-500';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={selectedIdx !== null}
                className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center space-x-2.5 ${btnStyle}`}
              >
                <span className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-400 flex-shrink-0">
                  {idx + 1}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback y Explicación */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-dark-bg/90 border border-gray-700 p-4 rounded-xl text-xs text-gray-300"
        >
          <div className="font-bold text-emerald-400 mb-1">
            {selectedIdx === currentCard.correctIndex ? '🎉 ¡Correcto!' : '💡 Punto para recordar:'}
          </div>
          <p className="leading-relaxed">{currentCard.explanation}</p>
        </motion.div>
      )}
    </div>
  );
};

export default DailyRetentionWidget;
