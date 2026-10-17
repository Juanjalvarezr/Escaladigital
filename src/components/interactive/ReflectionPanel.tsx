import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';
import { useLanguageStore } from '../../stores/useLanguageStore';

/* ─────────────────────────────────────────────────────────────── */
/*  TYPES                                                           */
/* ─────────────────────────────────────────────────────────────── */
interface ReflectionPanelProps {
  areaId: string;
  lessonId: string;
  onComplete?: () => void;
}

interface Question {
  id: string;
  esText: string;
  enText: string;
  placeholder_es: string;
  placeholder_en: string;
  emoji: string;
}

/* ─────────────────────────────────────────────────────────────── */
/*  QUESTIONS                                                       */
/* ─────────────────────────────────────────────────────────────── */
const QUESTIONS: Question[] = [
  {
    id: 'applied',
    emoji: '⚡',
    esText: '¿Qué fue lo más valioso que aprendiste en este módulo?',
    enText: 'What was the most valuable thing you learned in this module?',
    placeholder_es: 'Ej: Entender que la liquidez es más importante que la rentabilidad...',
    placeholder_en: 'E.g.: Understanding that cash flow matters more than profits...',
  },
  {
    id: 'action',
    emoji: '🎯',
    esText: '¿Qué acción concreta vas a implementar en tu negocio esta semana?',
    enText: 'What concrete action will you implement in your business this week?',
    placeholder_es: 'Ej: Voy a llamar a los 3 clientes con más de 30 días de deuda...',
    placeholder_en: 'E.g.: I will call the 3 clients with 30+ days overdue...',
  },
  {
    id: 'obstacle',
    emoji: '🚧',
    esText: '¿Qué obstáculo o duda tienes para aplicarlo? (Sé honesto/a)',
    enText: 'What obstacle or doubt do you have about applying it? (Be honest)',
    placeholder_es: 'Ej: No tengo claro cómo calcular el punto de equilibrio real...',
    placeholder_en: 'E.g.: I am not clear on how to calculate the real break-even...',
  },
];

/* ─────────────────────────────────────────────────────────────── */
/*  COMPONENT                                                       */
/* ─────────────────────────────────────────────────────────────── */
export const ReflectionPanel: React.FC<ReflectionPanelProps> = ({
  areaId,
  lessonId,
  onComplete,
}) => {
  const { addXp, businessName, saveWeeklyCommitment } = useLearningStore();
  const { lang } = useLanguageStore();
  const displayName = businessName || 'tu negocio';

  const storageKey = `reflection-${lessonId}`;
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch {
      return {};
    }
  });
  const [submitted, setSubmitted] = useState(() => {
    return localStorage.getItem(`${storageKey}-done`) === 'true';
  });
  const [weeklyCommitment, setWeeklyCommitment] = useState(() => {
    try { return localStorage.getItem(`${storageKey}-commitment`) || ''; } catch { return ''; }
  });
  const [activeIdx, setActiveIdx] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const setAnswer = (id: string, value: string) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const totalWords = Object.values(answers).join(' ').trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = Object.keys(answers).length >= 2 && totalWords >= 20;

  const handleSubmit = () => {
    setSubmitted(true);
    localStorage.setItem(`${storageKey}-done`, 'true');
    addXp(50, lang === 'es' ? 'Reflexión de módulo completada' : 'Module reflection completed');
    // Save weekly commitment
    if (weeklyCommitment.trim()) {
      try { localStorage.setItem(`${storageKey}-commitment`, weeklyCommitment.trim()); } catch { /* ignore */ }
      saveWeeklyCommitment(lessonId, weeklyCommitment.trim());
    }
    setShowSummary(true);
    setTimeout(() => onComplete?.(), 3000);
  };

  const title = lang === 'es' ? 'Panel de Reflexión' : 'Reflection Panel';
  const subtitle = lang === 'es'
    ? 'El aprendizaje profundo ocurre cuando conectas el conocimiento con tu realidad'
    : 'Deep learning happens when you connect knowledge to your reality';

  if (showSummary) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-secondary border border-gray-800 rounded-2xl p-8 text-center space-y-4"
      >
        <div className="text-5xl">🌱</div>
        <h3 className="text-2xl font-black text-white">
          {lang === 'es' ? '¡Reflexión guardada! +50 XP' : 'Reflection saved! +50 XP'}
        </h3>
        <p className="text-sm text-gray-400 max-w-sm mx-auto">
          {lang === 'es'
            ? 'Tus respuestas quedan guardadas. La próxima lección usará este contexto para generar contenido más relevante para ti.'
            : 'Your answers are saved. The next lesson will use this context to generate more relevant content for you.'}
        </p>
        {weeklyCommitment.trim() && (
          <div className="bg-violet/10 border border-violet/30 rounded-xl p-4 text-left">
            <div className="text-xs font-bold text-violet uppercase tracking-wider mb-1">📌 Tu compromiso de esta semana</div>
            <p className="text-sm text-gray-200 italic">"{weeklyCommitment.trim()}"</p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 mt-4 text-left">
          {QUESTIONS.map(q => (
            <div key={q.id} className="p-3 bg-dark-tertiary/50 border border-gray-700 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">{q.emoji} {lang === 'es' ? q.esText : q.enText}</p>
              <p className="text-sm text-gray-200 italic">"{answers[q.id] || '—'}"</p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-dark-secondary border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-electric-blue/10 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🌱</span>
          <div>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
              {title}
            </span>
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center space-x-2 mt-4">
          {QUESTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === activeIdx ? 'w-6 bg-emerald-400' : answers[QUESTIONS[i].id] ? 'w-2 bg-emerald-400/60' : 'w-2 bg-gray-700'
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">{activeIdx + 1} / {QUESTIONS.length}</span>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Question */}
            <div className="flex items-start space-x-3 p-4 bg-dark-tertiary/50 border border-gray-700 rounded-xl">
              <span className="text-2xl flex-shrink-0">{QUESTIONS[activeIdx].emoji}</span>
              <p className="text-sm font-semibold text-gray-200 leading-relaxed">
                {lang === 'es' ? QUESTIONS[activeIdx].esText : QUESTIONS[activeIdx].enText}
              </p>
            </div>

            {/* Answer */}
            <textarea
              value={answers[QUESTIONS[activeIdx].id] || ''}
              onChange={e => setAnswer(QUESTIONS[activeIdx].id, e.target.value)}
              placeholder={lang === 'es' ? QUESTIONS[activeIdx].placeholder_es : QUESTIONS[activeIdx].placeholder_en}
              disabled={submitted}
              rows={5}
              className="w-full bg-dark-bg border border-gray-700 focus:border-emerald-500/60 text-gray-200 placeholder-gray-600 text-sm rounded-xl p-4 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all leading-relaxed"
            />

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                disabled={activeIdx === 0}
                className="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 text-xs font-bold transition-all"
              >
                ← {lang === 'es' ? 'Anterior' : 'Previous'}
              </button>

              {activeIdx < QUESTIONS.length - 1 ? (
                <button
                  onClick={() => setActiveIdx(i => Math.min(QUESTIONS.length - 1, i + 1))}
                  disabled={!answers[QUESTIONS[activeIdx].id]?.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs hover:bg-emerald-500/30 disabled:opacity-40 transition-all"
                >
                  {lang === 'es' ? 'Siguiente' : 'Next'} →
                </button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitted}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-electric-blue text-white font-black rounded-xl text-xs transition-all disabled:opacity-40 shadow-lg"
                >
                  {lang === 'es' ? 'Guardar Reflexión (+50 XP) 🌱' : 'Save Reflection (+50 XP) 🌱'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {!canSubmit && activeIdx === QUESTIONS.length - 1 && (
          <p className="text-xs text-gray-600 text-center mt-3">
            {lang === 'es'
              ? `Responde al menos 2 preguntas con más de 20 palabras para guardar (tienes ${totalWords})`
              : `Answer at least 2 questions with 20+ words to save (you have ${totalWords})`}
          </p>
        )}

        {/* Weekly commitment card — always visible */}
        <div className="mt-6 pt-5 border-t border-gray-800">
          <label className="block text-xs font-black text-violet uppercase tracking-wider mb-2">
            📌 ¿Qué vas a cambiar esta semana en <span className="capitalize">{displayName}</span>?
          </label>
          <textarea
            value={weeklyCommitment}
            onChange={e => {
              setWeeklyCommitment(e.target.value);
              try { localStorage.setItem(`${storageKey}-commitment`, e.target.value); } catch { /* ignore */ }
            }}
            disabled={submitted}
            placeholder={`Escribe UNA cosa concreta que vas a implementar en ${displayName} esta semana a partir de lo que aprendiste hoy...`}
            rows={3}
            className="w-full bg-dark-bg border border-violet/30 focus:border-violet/60 text-gray-200 placeholder-gray-600 text-sm rounded-xl p-4 resize-none focus:outline-none focus:ring-1 focus:ring-violet/30 transition-all leading-relaxed"
          />
          <p className="text-[10px] text-gray-600 mt-1">Este compromiso aparece en tu Dashboard como recordatorio semanal.</p>
        </div>
      </div>
    </div>
  );
};

export default ReflectionPanel;
