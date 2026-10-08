import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';
import { ConfettiCelebration } from '../ui/ConfettiCelebration';
import { FinanceMarginSimulator } from '../interactive/FinanceMarginSimulator';
import { SalesObjectionSimulator } from '../interactive/SalesObjectionSimulator';
import { MicroWorkshopView } from '../interactive/MicroWorkshopView';
import { MarketingROISimulator } from '../interactive/MarketingROISimulator';
import { ReflectionPanel } from '../interactive/ReflectionPanel';
import { LessonProgressJourney } from './LessonProgressJourney';
import { LessonCompletionScreen } from './LessonCompletionScreen';
import { supabase } from '../../supabase';
import { useAuth } from '../SupabaseAuthProvider';
import { getYouTubeResources } from '../../data/youtubeResources';
import { getCompanyIdForUser, recordLearningEvent } from '../../services/learningEvents';
import { getLessonData } from '../../data/moduleLoader';
import { LESSONS_PER_MODULE } from '../../data/courseConfig';

interface InteractiveLessonViewProps {
  moduleId: string;
  lessonId: string;
  areaId: string;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const InteractiveLessonView: React.FC<InteractiveLessonViewProps> = ({
  moduleId,
  lessonId,
  areaId,
  onComplete,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}) => {
  const { user } = useAuth();
  const {
    addXp, toggleActionItem, completedActionItems, recordActivity,
    businessName, sector, checkAndUnlockBadges, addTimelineEvent
  } = useLearningStore();

  const [activeStep, setActiveStep] = useState<number>(0); // 0: Concepto, 1: Checkpoint, 2: Simulador, 3: Misiones, 4: MicroTaller, 5: Reflexión
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [checkpoint1Answer, setCheckpoint1Answer] = useState<number | null>(null);
  const [checkpoint1Feedback, setCheckpoint1Feedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [workshopDone, setWorkshopDone] = useState(false);

  const cleanArea = useMemo(() => {
    return (areaId || moduleId?.split('-')[0] || 'management').toLowerCase().trim();
  }, [areaId, moduleId]);

  const isFinance = cleanArea === 'finance' || moduleId.includes('finance');
  const isSales = cleanArea === 'sales' || moduleId.includes('sales');
  const isMarketing = cleanArea === 'marketing' || moduleId.includes('marketing');
  const youtubeResources = useMemo(() => getYouTubeResources(cleanArea), [cleanArea]);

  // Carga enriquecida del currículo real
  const lessonData = useMemo(() => {
    return getLessonData(cleanArea, moduleId, lessonId);
  }, [cleanArea, moduleId, lessonId]);

  // Verificar si la lección ya había sido completada previamente
  useEffect(() => {
    let isMounted = true;
    const checkCompletion = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('user_progress')
          .select('lessons_completed')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .maybeSingle();

        if (isMounted && data && Array.isArray(data.lessons_completed)) {
          if (data.lessons_completed.includes(lessonId)) {
            setIsCompleted(true);
          }
        }
      } catch (err) {
        console.warn('Error checking lesson completion', err);
      }
    };

    checkCompletion();
    return () => {
      isMounted = false;
    };
  }, [user, moduleId, lessonId]);

  const handleCheckpoint1Select = (idx: number) => {
    setCheckpoint1Answer(idx);
    if (idx === lessonData.checkpoint.correct) {
      setCheckpoint1Feedback(`✅ ${lessonData.checkpoint.explanation}`);
      addXp(30, 'Active Recall Checkpoint superado');
    } else {
      setCheckpoint1Feedback('❌ No exactamente. Revisa el concepto y vuelve a intentar.');
    }
  };

  const handleFinishLesson = async () => {
    if (isCompleted) return;
    setIsCompleted(true);
    setShowCelebration(true);
    addXp(100, 'Lección Interactiva completada');
    recordActivity();

    // Add to learning timeline
    addTimelineEvent({
      type: 'lesson',
      label: `Lección: ${lessonData.title}`,
      areaId: cleanArea,
      emoji: '📖',
      date: new Date().toISOString()
    });

    // Check badge unlocks (estimate based on local completed lessons count)
    const localKey = user ? `escala:lessons-count:${user.id}` : null;
    let localCount = 0;
    try {
      if (localKey) localCount = parseInt(window.localStorage.getItem(localKey) || '0', 10) + 1;
      if (localKey) window.localStorage.setItem(localKey, String(localCount));
    } catch { /* ignore */ }
    checkAndUnlockBadges(localCount, 0);

    // Show personalized completion screen before calling onComplete
    setTimeout(() => setShowCompletionScreen(true), 400);

    // Persistir progreso acumulativo en Supabase
    if (user) {
      try {
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('lessons_completed')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .maybeSingle();

        const prevLessons: string[] =
          existingProgress && Array.isArray(existingProgress.lessons_completed)
            ? existingProgress.lessons_completed
            : [];

        const updatedLessons = Array.from(new Set([...prevLessons, lessonId]));
        const completionPercentage = Math.min(100, Math.round((updatedLessons.length / LESSONS_PER_MODULE) * 100));
        const status = completionPercentage >= 100 ? 'completed' : 'in_progress';

        await supabase.from('user_progress').upsert({
          user_id: user.id,
          module_id: moduleId,
          status,
          completion_percentage: completionPercentage,
          lessons_completed: updatedLessons,
          last_accessed: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,module_id' });

        try {
          const cacheKey = `escala:progress:${user.id}:${moduleId}`;
          window.localStorage.setItem(cacheKey, JSON.stringify({
            lessons_completed: updatedLessons,
            completion_percentage: completionPercentage,
            status
          }));
        } catch {
          // ignore localstorage errors
        }
      } catch (e) {
        console.warn('Could not sync progress to Supabase', e);
      }

      void recordLearningEvent({
        companyId: getCompanyIdForUser(user),
        userId: user.id,
        eventType: 'lesson_completed',
        moduleKey: moduleId,
        lessonKey: lessonId,
        eventProperties: { areaId: cleanArea }
      });
    }
  };

  // Motivational contextual hint based on area + sector
  const motivationalHint = useMemo(() => {
    const name = businessName || 'tu negocio';
    const areaHints: Record<string, Record<string, string>> = {
      finance: {
        restaurant: `Con este concepto, ${name} puede aumentar su margen neto un 15% sin subir precios.`,
        fashion: `${name} puede identificar qué productos realmente generan rentabilidad.`,
        services: `${name} logrará cobrar lo que vale y mantener liquidez mes a mes.`,
        default: `${name} tomará decisiones financieras con más claridad y control.`,
      },
      sales: {
        restaurant: `${name} puede convertir más visitas en clientes recurrentes.`,
        fashion: `${name} aprenderá a presentar valor antes de mencionar el precio.`,
        services: `${name} cerrará más propuestas sin necesidad de dar descuentos.`,
        default: `${name} construirá un proceso de ventas que no dependa de la improvisación.`,
      },
      marketing: {
        default: `${name} llegará a más clientes ideales sin aumentar su presupuesto publicitario.`,
      },
      operations: {
        default: `${name} recuperará horas perdidas y entregará resultados más consistentes.`,
      },
      management: {
        default: `${name} dejará de depender de una sola persona para funcionar bien.`,
      },
    };
    const areaMap = areaHints[cleanArea] || areaHints['management'];
    return areaMap[sector] || areaMap['default'] || `Aplica este concepto directamente en ${name}.`;
  }, [cleanArea, sector, businessName]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Confetti Celebration */}
      <ConfettiCelebration
        trigger={showCelebration}
        message="¡Lección y Reto Dominados!"
        submessage="+100 XP sumados a tu nivel de escalabilidad"
      />

      {/* Personalized Completion Screen */}
      <LessonCompletionScreen
        show={showCompletionScreen}
        lessonTitle={lessonData.title}
        areaId={cleanArea}
        moduleNumber={1}
        totalModules={LESSONS_PER_MODULE}
        onDone={() => { setShowCompletionScreen(false); onComplete(); }}
      />

      {/* Top Breadcrumb & Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onPrevious}
          className="flex items-center text-xs font-bold text-gray-400 hover:text-white transition-colors"
        >
          ← Volver
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-dark-tertiary px-3 py-1 rounded-full text-gray-400 border border-gray-700">
            Módulo: <strong className="text-white capitalize">{areaId}</strong>
          </span>
          {isCompleted && (
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              Completado ✓
            </span>
          )}
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-dark-secondary via-dark-tertiary to-dark-secondary border border-gray-800 rounded-3xl p-8 mb-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-electric-blue/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <span className="text-xs font-black text-electric-blue uppercase tracking-widest bg-electric-blue/10 px-3 py-1 rounded-full border border-electric-blue/20">
            Microlearning Interactivo
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-2">
            {lessonData.title}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            {lessonData.summary}
          </p>

          {/* Contextual motivational hint */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 flex items-start space-x-2 bg-violet/10 border border-violet/25 rounded-xl px-4 py-3"
          >
            <span className="text-violet text-sm mt-0.5">💡</span>
            <p className="text-xs text-violet/90 leading-relaxed">
              <strong>Aplicado a tu negocio:</strong> {motivationalHint}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Visual Step Journey (replaces flat tabs) */}
      <LessonProgressJourney
        activeStep={activeStep}
        onStepClick={setActiveStep}
        workshopDone={workshopDone}
      />

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {activeStep === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-dark-secondary border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm mb-3">
                <span>🤔</span>
                <span>¿Qué es exactamente? (Sin rodeos)</span>
              </div>
              <p className="text-gray-200 leading-relaxed text-base">
                {lessonData.whatIs}
              </p>

              {lessonData.keyPoints && lessonData.keyPoints.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Principios fundamentales:</div>
                  <ul className="space-y-1.5">
                    {lessonData.keyPoints.map((kp, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {lessonData.caseStudy && (
              <div className="bg-gradient-to-br from-dark-secondary to-dark-tertiary border border-violet/40 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center space-x-2 text-violet font-bold text-sm mb-3">
                  <span>🏢</span>
                  <span>Caso Real: {lessonData.caseStudy.company}</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-red-400">Problema: </strong>
                    <span className="text-gray-300">{lessonData.caseStudy.problem}</span>
                  </div>
                  <div>
                    <strong className="text-electric-blue">Solución implementada: </strong>
                    <span className="text-gray-300">{lessonData.caseStudy.solution}</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                    <strong className="text-emerald-400">Resultado obtenido: </strong>
                    <span className="text-emerald-200 font-medium">{lessonData.caseStudy.result}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-dark-secondary border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center space-x-2 text-violet font-bold text-sm mb-3">
                <span>⚡</span>
                <span>¿Por qué cambia el destino de tu negocio?</span>
              </div>
              <p className="text-gray-200 leading-relaxed text-base">
                {lessonData.whyItMatters}
              </p>
            </div>

            <div className="bg-dark-secondary border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold text-red-300 uppercase tracking-wider">Aprende con video</span>
                  <h3 className="text-xl font-bold text-white mt-1">Videos recomendados de YouTube</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Búsquedas curadas para que elijas el contenido más actual y relevante.
                  </p>
                </div>
                <span className="text-2xl" aria-hidden="true">▶️</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {youtubeResources.map((video) => (
                  <a
                    key={video.title}
                    href={video.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-gray-700 bg-dark-tertiary/60 p-4 hover:border-red-400/70 hover:bg-red-500/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-red-400 group-hover:text-red-300" aria-hidden="true">▶</span>
                      <div>
                        <h4 className="font-semibold text-white">{video.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{video.description}</p>
                        <p className="text-[11px] text-gray-500 mt-2">{video.channelHint} · Abrir en YouTube ↗</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveStep(1)}
              className="w-full py-3.5 bg-gradient-to-r from-electric-blue to-violet text-white font-bold rounded-xl hover:opacity-95 transition-all text-sm flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Continuar al Checkpoint de Aprendizaje</span>
              <span>→</span>
            </button>
          </motion.div>
        )}

        {activeStep === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-dark-secondary border border-gray-800 rounded-2xl p-7 space-y-6"
          >
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🧠</span>
              <div>
                <span className="text-xs font-bold text-violet uppercase tracking-wider bg-violet/10 px-2 py-0.5 rounded-full border border-violet/20">
                  Active Recall Checkpoint
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Valida tu entendimiento antes de avanzar a la práctica
                </h3>
              </div>
            </div>

            <p className="text-base text-gray-200 font-semibold bg-dark-tertiary p-4 rounded-xl border border-gray-700">
              {lessonData.checkpoint.question}
            </p>

            <div className="space-y-3">
              {lessonData.checkpoint.options.map((opt, i) => {
                let btnStyle = 'border-gray-700 hover:border-gray-500 bg-dark-bg/60 text-gray-300';
                if (checkpoint1Answer !== null) {
                  if (i === lessonData.checkpoint.correct) {
                    btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-semibold';
                  } else if (i === checkpoint1Answer) {
                    btnStyle = 'border-red-500 bg-red-500/20 text-red-200';
                  } else {
                    btnStyle = 'opacity-30 border-gray-800 text-gray-500';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleCheckpoint1Select(i)}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-sm flex items-start space-x-3 ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {checkpoint1Feedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-dark-bg border border-gray-700 text-xs text-gray-200"
              >
                {checkpoint1Feedback}
              </motion.div>
            )}

            {checkpoint1Answer === lessonData.checkpoint.correct && (
              <button
                onClick={() => setActiveStep(2)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-electric-blue text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center space-x-2"
              >
                <span>¡Excelente! Entrar al Simulador Práctico</span>
                <span>→</span>
              </button>
            )}
          </motion.div>
        )}

        {activeStep === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {isFinance ? (
              <FinanceMarginSimulator onCompleted={() => setActiveStep(3)} />
            ) : isSales ? (
              <SalesObjectionSimulator onComplete={() => setActiveStep(3)} />
            ) : isMarketing ? (
              <MarketingROISimulator onComplete={() => setActiveStep(3)} />
            ) : (
              <div className="bg-dark-secondary border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">⚙️</span>
                  <h3 className="text-xl font-bold text-white">Laboratorio de Procesos y Prioridades</h3>
                </div>
                <p className="text-sm text-gray-300 mb-6">
                  El simulador te guía para aislar la fuga de tiempo más costosa de tu semana:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-dark-tertiary p-4 rounded-xl border border-gray-700">
                    <div className="text-amber-400 font-bold mb-1">Paso 1</div>
                    <div className="text-xs text-gray-300">Auditoría de tu agenda de los últimos 7 días.</div>
                  </div>
                  <div className="bg-dark-tertiary p-4 rounded-xl border border-gray-700">
                    <div className="text-electric-blue font-bold mb-1">Paso 2</div>
                    <div className="text-xs text-gray-300">Eliminar o delegar tareas de bajo impacto económico.</div>
                  </div>
                  <div className="bg-dark-tertiary p-4 rounded-xl border border-gray-700">
                    <div className="text-emerald-400 font-bold mb-1">Paso 3</div>
                    <div className="text-xs text-gray-300">Proteger 2 horas diarias de trabajo puramente estratégico.</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveStep(3)}
                  className="w-full py-3 bg-violet hover:bg-violet/90 text-white font-bold rounded-xl text-sm"
                >
                  Continuar a las Misiones Reales →
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeStep === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-dark-secondary border border-gray-800 rounded-2xl p-7 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                  Retención en Acción
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Misiones para tu Empresa Real</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  El aprendizaje solo se fija cuando lo aplicas. Marca cada acción ejecutada:
                </p>
              </div>
              <span className="text-2xl">📋</span>
            </div>

            <div className="space-y-3">
              {lessonData.actionItems.map((item, idx) => {
                const key = `${lessonId}-${idx}`;
                const checked = !!completedActionItems[key];

                return (
                  <div
                    key={idx}
                    onClick={() => toggleActionItem(key)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                      checked
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'
                        : 'bg-dark-tertiary/40 border-gray-700/80 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-1 w-5 h-5 rounded text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
                    />
                    <div className="flex-1 text-sm font-medium leading-relaxed">
                      {item}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA: go to MicroTaller */}
            <button
              onClick={() => setActiveStep(4)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>¡Perfecto! Ir al MicroTaller Práctico</span>
              <span>📋</span>
            </button>

            {/* Also allow finishing directly */}
            <button
              onClick={handleFinishLesson}
              disabled={isCompleted}
              className="w-full py-2 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-200 font-bold rounded-xl text-xs transition-all"
            >
              {isCompleted ? '✓ Completada' : 'Omitir Taller y Completar Lección'}
            </button>
          </motion.div>
        )}

        {/* ── STEP 4: MICRO-TALLER PRÁCTICO ── */}
        {activeStep === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <MicroWorkshopView
              areaId={areaId}
              lessonId={lessonId}
              onComplete={() => {
                setWorkshopDone(true);
                setActiveStep(5);
              }}
            />
          </motion.div>
        )}

        {/* ── STEP 5: PANEL DE REFLEXIÓN ── */}
        {activeStep === 5 && (
          <motion.div
            key="step-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <ReflectionPanel
              areaId={areaId}
              lessonId={lessonId}
              onComplete={handleFinishLesson}
            />

            {/* Also allow direct finish */}
            <button
              onClick={handleFinishLesson}
              disabled={isCompleted}
              className="w-full py-2 border border-gray-700 hover:border-gray-500 text-gray-500 hover:text-gray-300 font-bold rounded-xl text-xs transition-all"
            >
              {isCompleted ? '✓ Lección Completada' : 'Omitir Reflexión y Finalizar'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-800">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all"
        >
          ← Lección Anterior
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="px-5 py-2.5 rounded-xl bg-dark-tertiary hover:bg-dark-tertiary/80 border border-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center space-x-1"
        >
          <span>Siguiente Lección</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default InteractiveLessonView;
