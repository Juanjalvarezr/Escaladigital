import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticGeneratingViewProps {
  error?: string | null;
  onRetry?: () => void;
}

const MILESTONES = [
  'Analizando perfil de tu negocio y sector...',
  'Identificando principales cuellos de botella de crecimiento...',
  'Estructurando hoja de ruta secuencial con Inteligencia Artificial...',
  'Personalizando prioridades y primeros talleres prácticos...'
];

export const DiagnosticGeneratingView: React.FC<DiagnosticGeneratingViewProps> = ({ error, onRetry }) => {
  const [currentMilestone, setCurrentMilestone] = useState(0);

  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setCurrentMilestone(prev => (prev < MILESTONES.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(interval);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg text-white p-4 relative overflow-hidden">
      {/* Glow ambiental */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[150px] opacity-25 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-blue rounded-full mix-blend-screen filter blur-[150px] opacity-25" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-dark-secondary/85 backdrop-blur-2xl border border-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl text-center relative z-10"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-electric-blue to-violet animate-spin-slow opacity-75 blur-sm" />
          <div className="relative w-full h-full rounded-2xl bg-dark-bg border border-gray-700 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-electric-blue animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
          Diseñando tu Ruta Personalizada
        </h2>
        <p className="text-sm text-gray-400 mb-8">
          Nuestra IA está procesando las respuestas para adaptar cada fase a tu negocio.
        </p>

        {error ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-sm text-red-300 flex items-start gap-2 text-left">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="w-full py-3.5 px-4 bg-dark-tertiary border border-gray-700 rounded-xl text-white font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reintentar generación</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5 text-left bg-dark-bg/60 border border-gray-800/80 p-5 rounded-2xl">
            {MILESTONES.map((milestone, idx) => {
              const isDone = idx < currentMilestone;
              const isCurrent = idx === currentMilestone;
              return (
                <div key={idx} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-electric-blue border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-700 shrink-0" />
                  )}
                  <span className={`text-xs font-medium transition-colors ${
                    isDone ? 'text-gray-300' : isCurrent ? 'text-white font-bold' : 'text-gray-500'
                  }`}>
                    {milestone}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};
