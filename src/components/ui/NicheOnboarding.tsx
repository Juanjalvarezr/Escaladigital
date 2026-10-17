import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';
import { useAuth } from '../SupabaseAuthProvider';

const SECTORS = [
  { id: 'restaurant', label: 'Restaurante / Food', emoji: '🍽️' },
  { id: 'fashion', label: 'Moda / Ropa', emoji: '👗' },
  { id: 'services', label: 'Servicios Profesionales', emoji: '💼' },
  { id: 'tech', label: 'Tecnología / Digital', emoji: '💻' },
  { id: 'health', label: 'Salud / Bienestar', emoji: '🏥' },
  { id: 'education', label: 'Educación / Formación', emoji: '📚' },
  { id: 'retail', label: 'Comercio / Tienda', emoji: '🛍️' },
  { id: 'other', label: 'Otro', emoji: '🌐' },
];

const CHALLENGES = [
  { id: 'sales', label: 'Aumentar mis ventas', emoji: '🚀' },
  { id: 'processes', label: 'Ordenar mis procesos', emoji: '⚙️' },
  { id: 'time', label: 'Recuperar mi tiempo', emoji: '⏰' },
];

const DISMISSED_KEY = 'escala:nicheOnboardingDismissed:v1';

const readGuestBusinessName = () => {
  try {
    const profile = JSON.parse(window.localStorage.getItem('escala:userProfile:v1') || '{}');
    return profile.companyName || '';
  } catch {
    return '';
  }
};

const wasDismissed = () => {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const NicheOnboarding: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { onboardingComplete, setBusinessProfile } = useLearningStore();
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState(readGuestBusinessName);
  const [sector, setSector] = useState('');
  const [challenge, setChallenge] = useState('');
  const [visible, setVisible] = useState(() => !wasDismissed());
  const registeredUser = Boolean(user?.email && !user.id.startsWith('guest_'));

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // Dismissal still applies for the current render if storage is unavailable.
    }
  };

  if (!registeredUser || onboardingComplete || !visible || location.pathname.includes('/platform-admin') || location.pathname.includes('/admin')) return null;


  const handleFinish = () => {
    if (!businessName.trim() || !sector || !challenge) return;
    setBusinessProfile(businessName.trim(), sector, challenge);
    dismiss();
  };

  const canAdvance0 = businessName.trim().length >= 2;
  const canAdvance1 = !!sector;
  const canFinish = canAdvance0 && canAdvance1 && !!challenge;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-full max-w-lg bg-dark-secondary border border-gray-700 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header gradient */}
            <div className="relative bg-gradient-to-br from-electric-blue/20 via-violet/20 to-dark-secondary p-8 pb-6 border-b border-gray-800">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet/20 rounded-full blur-3xl pointer-events-none" />
              <button
                type="button"
                onClick={dismiss}
                className="absolute right-4 top-4 rounded-lg border border-gray-700 px-3 py-2 text-sm font-semibold text-gray-300 hover:border-gray-500 hover:text-white"
              >
                Ahora no
              </button>
              <span className="text-4xl mb-3 block">⚡</span>
              <h2 className="text-2xl font-black text-white">
                ¡Bienvenido a Escala Digital!
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Necesitamos 30 segundos para personalizar tu experiencia.
              </p>

              {/* Step dots */}
              <div className="flex space-x-2 mt-5">
                {[0, 1, 2].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      s === step
                        ? 'w-8 bg-electric-blue'
                        : s < step
                        ? 'w-4 bg-emerald-400'
                        : 'w-4 bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 0: Business Name */}
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        ¿Cuál es el nombre de tu marca o negocio?
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && canAdvance0 && setStep(1)}
                        placeholder="Ej: Café Aroma, Studio Luna, Constructora XYZ..."
                        className="w-full bg-dark-tertiary border border-gray-700 focus:border-electric-blue rounded-xl px-4 py-3.5 text-white text-base placeholder-gray-600 outline-none transition-colors"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      disabled={!canAdvance0}
                      className="w-full py-3.5 bg-gradient-to-r from-electric-blue to-violet text-white font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm hover:opacity-90"
                    >
                      Continuar →
                    </button>
                  </motion.div>
                )}

                {/* Step 1: Sector */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      ¿En qué sector opera <strong className="text-electric-blue">{businessName}</strong>?
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {SECTORS.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSector(s.id)}
                          className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left text-sm font-semibold transition-all ${
                            sector === s.id
                              ? 'border-electric-blue bg-electric-blue/15 text-white'
                              : 'border-gray-700 bg-dark-tertiary/50 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <span className="text-lg">{s.emoji}</span>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setStep(0)}
                        className="flex-1 py-3 border border-gray-700 text-gray-400 font-bold rounded-xl text-sm hover:border-gray-500 transition-all"
                      >
                        ← Atrás
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        disabled={!canAdvance1}
                        className="flex-[2] py-3 bg-gradient-to-r from-electric-blue to-violet text-white font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm hover:opacity-90"
                      >
                        Continuar →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Main Challenge */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      ¿Cuál es tu mayor reto HOY con <strong className="text-electric-blue">{businessName}</strong>?
                    </label>
                    <div className="space-y-3">
                      {CHALLENGES.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setChallenge(c.id)}
                          className={`w-full flex items-center space-x-4 p-4 rounded-xl border text-left text-sm font-semibold transition-all ${
                            challenge === c.id
                              ? 'border-violet bg-violet/15 text-white'
                              : 'border-gray-700 bg-dark-tertiary/50 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <span className="text-2xl">{c.emoji}</span>
                          <span className="text-base">{c.label}</span>
                          {challenge === c.id && (
                            <span className="ml-auto text-violet text-lg">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border border-gray-700 text-gray-400 font-bold rounded-xl text-sm hover:border-gray-500 transition-all"
                      >
                        ← Atrás
                      </button>
                      <button
                        onClick={handleFinish}
                        disabled={!canFinish}
                        className="flex-[2] py-3 bg-gradient-to-r from-emerald-500 to-electric-blue text-white font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm hover:opacity-90 flex items-center justify-center space-x-2"
                      >
                        <span>🚀 ¡Empezar mi ruta personalizada!</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
