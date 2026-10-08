import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../components/SupabaseAuthProvider';
import { supabase } from '../supabase';
import { BUSINESS_AREAS, MODULE_CATALOG } from '../types';
import { LESSONS_PER_MODULE, QUIZZES_PER_MODULE } from '../data/courseConfig';
import AreaCard from '../components/AreaCard';
import ProfileMenu from '../components/ProfileMenu';
import { useLearningStore } from '../stores/useLearningStore';
import { BusinessRadarChart } from '../components/interactive/BusinessRadarChart';
import { DailyRetentionWidget } from '../components/interactive/DailyRetentionWidget';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { DiagnosticResult } from '../services/gemini';
import { readUserDiagnostic, writeUserDiagnostic } from '../utils/userScopedStorage';

interface ProgressData {
  [areaId: string]: {
    completedLessons: number;
    totalLessons: number;
    completedQuizzes: number;
    totalQuizzes: number;
  };
}

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { xp, streakDays, businessLevel, recordActivity, learningTimeline, weeklyCommitments, badges, businessName } = useLearningStore();

  const [progress, setProgress] = useState<ProgressData>({});
  const [loading, setLoading] = useState(true);
  const [diagnostic, setDiagnostic] = useState<any>(null);

  useEffect(() => {
    recordActivity();

    setDiagnostic(readUserDiagnostic<DiagnosticResult>(user?.id));

    const loadRealProgress = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data: diagnosticData, error: diagnosticError } = await supabase
          .from('user_diagnostics')
          .select('business_type, main_challenge, business_description, executive_summary, generation_source, scalability_roadmap, recommended_modules')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (diagnosticData && !diagnosticError) {
          const remoteDiagnostic: DiagnosticResult = {
            businessType: diagnosticData.business_type,
            mainChallenge: diagnosticData.main_challenge,
            executiveSummary: diagnosticData.executive_summary || `Tu negocio es ${diagnosticData.business_type}. El reto principal identificado es ${diagnosticData.main_challenge}.`,
            generationSource: diagnosticData.generation_source === 'fallback' ? 'fallback' : 'ai',
            scalabilityRoadmap: Array.isArray(diagnosticData.scalability_roadmap) ? diagnosticData.scalability_roadmap : [],
            recommendedModules: Array.isArray(diagnosticData.recommended_modules) ? diagnosticData.recommended_modules : []
          };
          setDiagnostic(remoteDiagnostic);
          writeUserDiagnostic(user.id, remoteDiagnostic);
        } else if (diagnosticError) {
          console.warn('No se pudo cargar el diagnóstico remoto; se conserva el respaldo local', diagnosticError);
        }

        const { data: progressData, error } = await supabase
          .from('user_progress')
          .select('module_id, completion_percentage, lessons_completed, status')
          .eq('user_id', user.id);

        const zeroProgress: ProgressData = {};
        BUSINESS_AREAS.forEach(area => {
          const moduleCount = MODULE_CATALOG[area.id]?.length || 0;
          zeroProgress[area.id] = {
            completedLessons: 0,
            totalLessons: moduleCount * LESSONS_PER_MODULE,
            completedQuizzes: 0,
            totalQuizzes: moduleCount * QUIZZES_PER_MODULE
          };
        });

        if (error) {
          setProgress(zeroProgress);
          return;
        }

        const realProgress = { ...zeroProgress };
        const completedByArea: Record<string, { lessons: number; quizzes: number }> = {};

        // Inicializar áreas
        BUSINESS_AREAS.forEach(area => {
          completedByArea[area.id] = { lessons: 0, quizzes: 0 };
        });

        // 1. Cargar datos de Supabase si existen
        progressData?.forEach((p: any) => {
          const areaId = String(p.module_id || '').split('-')[0];
          if (realProgress[areaId]) {
            completedByArea[areaId].lessons += Array.isArray(p.lessons_completed) ? p.lessons_completed.length : 0;
            completedByArea[areaId].quizzes += (Number(p.completion_percentage) || 0) >= 60 ? 1 : 0;
          }
        });

        // 2. Combinar con respaldo local (resiliente)
        BUSINESS_AREAS.forEach(area => {
          const moduleList = MODULE_CATALOG[area.id] || [];
          moduleList.forEach(mod => {
            try {
              const stored = window.localStorage.getItem(`escala:progress:${user.id}:${mod.id}`);
              if (stored) {
                const parsed = JSON.parse(stored);
                const localCount = Array.isArray(parsed.lessons_completed) ? parsed.lessons_completed.length : 0;
                if (localCount > completedByArea[area.id].lessons) {
                  completedByArea[area.id].lessons = localCount;
                }
                if (Number(parsed.completion_percentage) >= 60 && completedByArea[area.id].quizzes === 0) {
                  completedByArea[area.id].quizzes = 1;
                }
              }
            } catch {
              // ignore
            }
          });
        });

        Object.entries(completedByArea).forEach(([areaId, values]) => {
          if (realProgress[areaId]) {
            realProgress[areaId].completedLessons = values.lessons;
            realProgress[areaId].completedQuizzes = values.quizzes;
          }
        });

        setProgress(realProgress);
      } catch (error) {
        console.warn('Could not load user progress', error);
        const fallback: ProgressData = {};
        BUSINESS_AREAS.forEach(area => {
          const moduleCount = MODULE_CATALOG[area.id]?.length || 0;
          fallback[area.id] = {
            completedLessons: 0,
            totalLessons: moduleCount * LESSONS_PER_MODULE,
            completedQuizzes: 0,
            totalQuizzes: moduleCount * QUIZZES_PER_MODULE
          };
        });
        setProgress(fallback);
      } finally {
        setLoading(false);
      }
    };

    loadRealProgress();
  }, [user, recordActivity]);

  const handleAreaClick = (areaId: string) => {
    const normalizedAreaId = areaId.includes('-') ? areaId.split('-')[0] : areaId;
    navigate(`/area/${normalizedAreaId}`);
  };

  // Convert progress into percentage scores for the radar chart
  const radarScores: Record<string, number> = {};
  BUSINESS_AREAS.forEach(area => {
    const areaProg = progress[area.id];
    if (areaProg) {
      const pct = Math.round(
        ((areaProg.completedLessons + areaProg.completedQuizzes) /
         (areaProg.totalLessons + areaProg.totalQuizzes)) * 100
      );
      // Give at least a base score or calculated percentage
      radarScores[area.id] = Math.max(0, Math.min(100, pct));
    } else {
      radarScores[area.id] = 30;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Sincronizando Torre de Control...</p>
        </div>
      </div>
    );
  }

  const completedLessonsTotal = Object.values(progress).reduce((acc, a) => acc + a.completedLessons, 0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-dark-bg text-white pb-16">
      {/* Top Navigation Bar */}
      <header className="bg-dark-secondary/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-violet">
                  Escala Digital
                </h1>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider hidden sm:block">
                  Torre de Control Empresarial
                </div>
              </div>
            </div>

            {/* Gamification Bar */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Streak */}
              <div className="flex items-center space-x-1.5 bg-dark-tertiary px-3 py-1 rounded-full border border-gray-700 shadow-inner">
                <span className="text-base animate-pulse">🔥</span>
                <span className="text-xs font-bold text-amber-400">{streakDays}</span>
                <span className="text-[11px] text-gray-400 hidden sm:inline">días racha</span>
              </div>

              {/* XP & Level */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-violet/20 to-electric-blue/20 px-3.5 py-1 rounded-full border border-violet/30">
                <span className="text-sm">{businessLevel.badge}</span>
                <div className="text-left">
                  <div className="text-xs font-black text-white">{xp} XP</div>
                  <div className="text-[10px] text-gray-300 hidden md:block">{businessLevel.title}</div>
                </div>
              </div>

              <LanguageToggle />

              <ProfileMenu user={user} onSignOut={signOut} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {businessName
                ? `¡Torre de Control lista, ${user?.user_metadata?.name || user?.email?.split('@')[0] || 'Líder'}!`
                : `¡Torre de Control lista, ${user?.user_metadata?.name || user?.email?.split('@')[0] || 'Líder'}!`}
            </h2>
            {businessName && (
              <p className="text-electric-blue text-sm font-bold mt-0.5">
                🏗️ Construyendo: <span className="text-white">{businessName}</span>
              </p>
            )}
            <p className="text-gray-400 text-sm mt-1">
              Nivel actual: <strong className="text-violet">{businessLevel.title}</strong> • Siguiente hito a los {businessLevel.nextLevelXp} XP.
            </p>
          </div>

          {/* Quick Access to Simulators */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/academia-procesos')}
              className="text-xs font-bold bg-electric-blue/15 hover:bg-electric-blue/25 text-electric-blue border border-electric-blue/30 px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5"
            >
              <span>🧭</span>
              <span>Academia de Procesos</span>
            </button>
            <button
              onClick={() => handleAreaClick('finance')}
              className="text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5"
            >
              <span>🧮</span>
              <span>Simulador de Precios</span>
            </button>
            <button
              onClick={() => handleAreaClick('sales')}
              className="text-xs font-bold bg-violet/15 hover:bg-violet/25 text-violet border border-violet/30 px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5"
            >
              <span>🎯</span>
              <span>Simulador de Ventas</span>
            </button>
          </div>
        </div>

        {/* Daily Retention Challenge (Spaced Repetition Widget) */}
        <DailyRetentionWidget />

        <section className="rounded-2xl border border-violet/30 bg-violet/10 p-5" aria-labelledby="next-step-title">
          <p className="text-xs font-bold uppercase tracking-wider text-violet">Tu siguiente avance</p>
          <h3 id="next-step-title" className="mt-1 text-lg font-bold">
            {!diagnostic ? 'Descubre tu punto de partida' : completedLessonsTotal === 0 ? 'Convierte tu diagnóstico en una acción' : 'Continúa con tu siguiente lección'}
          </h3>
          <p className="mt-1 text-sm text-gray-300">
            {!diagnostic
              ? 'Completa el diagnóstico para recibir una ruta adaptada a tu empresa.'
              : completedLessonsTotal === 0
                ? 'Tu ruta ya está creada. Empieza una lección breve y aplica una recomendación hoy.'
                : `Llevas ${completedLessonsTotal} lección${completedLessonsTotal === 1 ? '' : 'es'} completada${completedLessonsTotal === 1 ? '' : 's'}. Elige un pilar para seguir avanzando.`}
          </p>
          <button
            type="button"
            onClick={() => navigate(!diagnostic ? '/diagnostic' : '/area/finance')}
            className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500"
          >
            {!diagnostic ? 'Completar diagnóstico' : 'Continuar aprendizaje'}
          </button>
        </section>

        {/* Diagnostic 360 & Radar Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Chart Component (5 cols) */}
          <div className="lg:col-span-5">
            <BusinessRadarChart
              progressScores={radarScores}
              onAreaSelect={handleAreaClick}
            />
          </div>

          {/* AI Executive Roadmap / Insights (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* AI Summary Box */}
            {diagnostic?.executiveSummary ? (
              <div className="bg-gradient-to-r from-dark-secondary to-dark-tertiary rounded-2xl p-6 border border-electric-blue/30 shadow-[0_0_20px_rgba(0,195,255,0.1)] relative overflow-hidden">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-electric-blue/20 text-electric-blue text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-electric-blue/30">
                    Diagnóstico IA Personalizado
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{diagnostic.businessType}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Enfoque Táctico Recomendado</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  "{diagnostic.executiveSummary}"
                </p>
              </div>
            ) : (
              <div className="bg-dark-secondary rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-violet/20 text-violet text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-violet/30">
                    Ruta de Escalabilidad
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Estrategia de Crecimiento Ordenado</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Completa los módulos clave en orden para fortalecer las finanzas, sistematizar las ventas y crear procesos que permitan delegar sin perder calidad.
                </p>
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-secondary p-4 rounded-xl border border-gray-800 text-center">
                <div className="text-2xl font-black text-electric-blue">{completedLessonsTotal}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Lecciones Completadas</div>
              </div>
              <div className="bg-dark-secondary p-4 rounded-xl border border-gray-800 text-center">
                <div className="text-2xl font-black text-emerald-400">{streakDays} 🔥</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Días de Hábito Activo</div>
              </div>
              <div className="bg-dark-secondary p-4 rounded-xl border border-gray-800 text-center">
                <div className="text-2xl font-black text-violet">{BUSINESS_AREAS.length}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Pilares Estratégicos</div>
              </div>
            </div>
          </div>
        </div>

        {/* 8 Business Pillars Grid */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-white flex items-center">
              <span className="w-2.5 h-2.5 bg-electric-blue rounded-full mr-2.5 shadow-[0_0_10px_#00C3FF]"></span>
              Pilares de Escalamiento de tu Empresa
            </h3>
            <span className="text-xs text-gray-400">Selecciona un área para entrar a sus lecciones y simuladores</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {BUSINESS_AREAS.map((area) => (
              <motion.div
                key={area.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <AreaCard
                  area={area}
                  progress={progress[area.id]}
                  onClick={() => handleAreaClick(area.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── LEARNING TIMELINE ── */}
        {learningTimeline.length > 0 && (
          <section aria-labelledby="timeline-title">
            <h3 id="timeline-title" className="text-lg font-bold text-white mb-4 flex items-center">
              <span className="w-2.5 h-2.5 bg-violet rounded-full mr-2.5 shadow-[0_0_10px_#7C3AED]"></span>
              Mi Evolución — Timeline de Aprendizaje
            </h3>
            <div className="relative">
              {/* Horizontal scroll timeline */}
              <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
                {learningTimeline.slice(0, 12).map((event, idx) => (
                  <div
                    key={event.id}
                    className="flex-shrink-0 flex flex-col items-center"
                    style={{ minWidth: 100 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-dark-secondary border-2 border-violet/40 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(124,58,237,0.2)]">
                      {event.emoji}
                    </div>
                    {idx < learningTimeline.slice(0, 12).length - 1 && (
                      <div className="absolute hidden" /> /* connector handled by flex */
                    )}
                    <div className="mt-2 text-center">
                      <div className="text-[10px] font-bold text-gray-300 leading-tight max-w-[88px] text-center">
                        {event.label}
                      </div>
                      <div className="text-[9px] text-gray-600 mt-0.5">
                        {new Date(event.date).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── WEEKLY COMMITMENT ── */}
        {(() => {
          const commitmentEntries = Object.entries(weeklyCommitments);
          const latest = commitmentEntries[commitmentEntries.length - 1];
          if (!latest) return null;
          return (
            <section className="rounded-2xl border border-violet/30 bg-violet/10 p-5">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📌</span>
                <div className="flex-1">
                  <div className="text-xs font-black text-violet uppercase tracking-wider mb-1">
                    Tu compromiso de esta semana
                  </div>
                  <p className="text-sm text-gray-200 italic leading-relaxed">
                    "{latest[1]}"
                  </p>
                  <p className="text-[10px] text-gray-500 mt-2">
                    Registrado en: lección {latest[0]}
                  </p>
                </div>
              </div>
            </section>
          );
        })()}

        {/* ── BADGES SHOWCASE ── */}
        {(() => {
          const unlocked = badges.filter(b => b.unlockedAt);
          return (
            <section aria-labelledby="badges-title">
              <h3 id="badges-title" className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full mr-2.5 shadow-[0_0_10px_#fbbf24]"></span>
                Insignias y Logros
                {unlocked.length > 0 && (
                  <span className="ml-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                    {unlocked.length} / {badges.length}
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                      badge.unlockedAt
                        ? 'border-amber-400/40 bg-amber-400/10 shadow-[0_0_16px_rgba(251,191,36,0.15)]'
                        : 'border-gray-800 bg-dark-secondary opacity-40 grayscale'
                    }`}
                  >
                    <span className="text-3xl mb-1.5">{badge.emoji}</span>
                    <span className="text-[10px] font-bold text-gray-300 leading-tight">{badge.name}</span>
                    {badge.unlockedAt && (
                      <span className="text-[9px] text-amber-400 mt-1">
                        {new Date(badge.unlockedAt).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                    {!badge.unlockedAt && (
                      <span className="text-[9px] text-gray-600 mt-1">🔒 Bloqueado</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })()}
      </main>
    </div>
  );
};

export default DashboardPage;
