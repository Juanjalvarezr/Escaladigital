import React from 'react';
import { motion } from 'framer-motion';

interface Step {
  id: number;
  label: string;
  icon: string;
  shortLabel: string;
}

interface LessonProgressJourneyProps {
  activeStep: number;
  onStepClick: (id: number) => void;
  workshopDone?: boolean;
}

const STEPS: Step[] = [
  { id: 0, label: 'Fundamento', shortLabel: 'Fundamento', icon: '💡' },
  { id: 1, label: 'Recuerdo Activo', shortLabel: 'Checkpoint', icon: '🧠' },
  { id: 2, label: 'Simulador', shortLabel: 'Simulador', icon: '🛠️' },
  { id: 3, label: 'Misiones', shortLabel: 'Misiones', icon: '🎯' },
  { id: 4, label: 'MicroTaller', shortLabel: 'Taller', icon: '📋' },
  { id: 5, label: 'Reflexión', shortLabel: 'Reflexión', icon: '🌱' },
];

export const LessonProgressJourney: React.FC<LessonProgressJourneyProps> = ({
  activeStep,
  onStepClick,
  workshopDone = false,
}) => {
  return (
    <div className="bg-dark-secondary border border-gray-800 rounded-2xl px-4 sm:px-6 py-4 mb-8">
      {/* Mobile: compact pills */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Progreso de lección
          </span>
          <span className="text-[10px] text-gray-400">
            Paso {activeStep + 1} de {STEPS.length}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            className="h-2 rounded-full bg-gradient-to-r from-electric-blue to-violet"
            initial={{ width: 0 }}
            animate={{ width: `${((activeStep) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-base">{STEPS[activeStep].icon}</span>
          <span className="text-xs font-bold text-white">{STEPS[activeStep].label}</span>
        </div>
      </div>

      {/* Desktop: full journey map */}
      <div className="hidden sm:block">
        <div className="flex items-center mb-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Tu recorrido en esta lección
          </span>
        </div>
        <div className="flex items-center relative pt-2 pb-1">
          {STEPS.map((step, idx) => {
            const isCompleted = step.id < activeStep || (step.id === 4 && workshopDone);
            const isActive = step.id === activeStep;

            return (
              <React.Fragment key={step.id}>
                {/* Step Node */}
                <div className="flex flex-col items-center relative z-10" style={{ minWidth: 52 }}>
                  <button
                    onClick={() => onStepClick(step.id)}
                    title={step.label}
                    className="relative flex flex-col items-center group"
                    type="button"
                  >
                    {/* Circle */}
                    <motion.div
                      className={`
                        w-9 h-9 rounded-full border-2 flex items-center justify-center text-base font-bold
                        transition-all duration-300
                        ${isCompleted
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                          : isActive
                          ? 'border-electric-blue bg-electric-blue/20 text-white shadow-[0_0_14px_rgba(0,195,255,0.5)]'
                          : 'border-gray-700 bg-dark-tertiary text-gray-600 group-hover:border-gray-500 group-hover:text-gray-400'
                        }
                      `}
                      animate={isActive ? { scale: [1, 1.07, 1] } : { scale: 1 }}
                      transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
                    >
                      {isCompleted ? (
                        <span className="text-emerald-400 text-sm">✓</span>
                      ) : (
                        <span>{step.icon}</span>
                      )}
                    </motion.div>

                    {/* Label */}
                    <span
                      className={`mt-1.5 text-[10px] font-bold text-center leading-tight whitespace-nowrap transition-colors ${
                        isActive
                          ? 'text-electric-blue'
                          : isCompleted
                          ? 'text-emerald-400'
                          : 'text-gray-600'
                      }`}
                    >
                      {step.shortLabel}
                    </span>
                  </button>
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 relative h-0.5 mx-0.5 top-[-10px]">
                    <div className="absolute inset-0 bg-gray-800 rounded-full" />
                    {step.id < activeStep && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-electric-blue"
                        initial={{ scaleX: 0, originX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
