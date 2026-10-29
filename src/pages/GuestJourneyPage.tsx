import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/SupabaseAuthProvider';
import { supabase, isSupabaseConfigured } from '../supabase';
import { BUSINESS_AREAS } from '../types';
import { DiagnosticResult } from '../services/gemini';
import {
  GuestWorkshopProgress,
  readGuestWorkshopProgress,
  readUserDiagnostic,
  writeGuestWorkshopProgress,
  writeUserDiagnostic
} from '../utils/userScopedStorage';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Rocket,
  X,
  AlertCircle,
  Key,
  Target,
  BarChart3
} from 'lucide-react';

const readProfile = () => {
  try {
    return JSON.parse(window.localStorage.getItem('escala:userProfile:v1') || '{}') as { 
      nombre?: string; 
      companyName?: string;
      businessType?: string;
      goals?: string;
      description?: string;
    };
  } catch {
    return {};
  }
};

const compactPhaseDescription = (description: string) => {
  const firstParagraph = description.split('\n')[0].trim();
  const firstIdea = firstParagraph.split(/\s+-\s+/)[0].trim();
  return firstIdea || description;
};

const GuestJourneyPage: React.FC = () => {
  const { user, signUpWithEmail, signInWithEmail, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();

  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(() =>
    readUserDiagnostic<DiagnosticResult>(user?.id) || readUserDiagnostic<DiagnosticResult>(null)
  );
  const [profile] = useState(readProfile);
  const [progress, setProgress] = useState<GuestWorkshopProgress | null>(readGuestWorkshopProgress);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'diagnosis' | 'workshop'>('roadmap');
  const [activePhase, setActivePhase] = useState(0);
  const routeTrackRef = useRef<HTMLDivElement>(null);

  // Modal de guardado de cuenta
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modalMode, setModalMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState(() => profile.nombre || '');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  useEffect(() => {
    setDiagnostic(readUserDiagnostic<DiagnosticResult>(user?.id) || readUserDiagnostic<DiagnosticResult>(null));
  }, [user?.id]);

  const firstPhase = diagnostic?.scalabilityRoadmap?.[0];
  const areaId = firstPhase?.moduleId || diagnostic?.recommendedModules?.[0] || 'management';
  const area = BUSINESS_AREAS.find((item) => item.id === areaId);
  const workshopModuleId = `${areaId}-guest-workshop`;
  const workshopLessonId = `first-workshop:${areaId}`;
  const currentProgress = progress?.moduleId === workshopModuleId ? progress : null;
  const [response, setResponse] = useState(currentProgress?.response || '');
  const hasRegisteredAccount = Boolean(user?.email && !user.is_anonymous && !user.id.startsWith('guest_'));

  const moveRoute = (direction: -1 | 1) => {
    const track = routeTrackRef.current;
    if (!track) return;
    const phaseCount = diagnostic?.scalabilityRoadmap?.length || 0;
    const nextIndex = Math.max(0, Math.min(phaseCount - 1, activePhase + direction));
    const card = track.children.item(nextIndex) as HTMLElement | null;
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setActivePhase(nextIndex);
  };

  const updateActivePhase = () => {
    const track = routeTrackRef.current;
    if (!track) return;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    Array.from(track.children).forEach((child, index) => {
      const distance = Math.abs((child as HTMLElement).offsetLeft - track.scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActivePhase(closestIndex);
  };

  const saveWorkshopAction = (completed: boolean) => {
    const nextProgress: GuestWorkshopProgress = {
      moduleId: workshopModuleId,
      lessonId: workshopLessonId,
      response,
      completed,
      updatedAt: new Date().toISOString()
    };
    writeGuestWorkshopProgress(nextProgress);
    setProgress(nextProgress);

    if (completed) {
      try { window.localStorage.setItem('escala:firstModuleCompleted:v1', 'true'); } catch {}
    }

    if (user?.email && !user.id.startsWith('guest_')) {
      void supabase.from('user_progress').upsert({
        user_id: user.id,
        module_id: workshopModuleId,
        status: completed ? 'completed' : 'in_progress',
        completion_percentage: completed ? 100 : 25,
        lessons_completed: completed ? [workshopLessonId] : [],
        action_response: response.trim(),
        last_accessed: nextProgress.updatedAt,
        updated_at: nextProgress.updatedAt
      }, { onConflict: 'user_id,module_id' });
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!isSupabaseConfigured) {
      setAuthError('El sistema de cuentas no está configurado todavía. Contacta al administrador.');
      return;
    }

    setAuthSubmitting(true);

    try {
      if (modalMode === 'signup') {
        try {
          await signUpWithEmail(authEmail.trim(), authPassword, {
            email: authEmail.trim(),
            displayName: authName.trim(),
            company: profile.companyName || undefined
          });

          // Sync diagnostic if created
          if (diagnostic) {
            writeUserDiagnostic(null, diagnostic);
          }

          setAuthSuccess('¡Cuenta creada exitosamente! Tu ruta quedó vinculada.');
          setTimeout(() => {
            setShowSaveModal(false);
            navigate('/dashboard');
          }, 1500);
        } catch (err: any) {
          const msg = err?.message || '';
          if (msg.toLowerCase().includes('user already registered') || msg.toLowerCase().includes('already exists')) {
            // Usuario ya registrado: cambiar suavemente a signin con mensaje amigable
            setModalMode('signin');
            setAuthError('Detectamos que este correo ya tiene una cuenta registrada. Ingresa tu contraseña para vincularla o usa el Enlace Mágico.');
          } else {
            setAuthError(msg || 'No se pudo crear la cuenta.');
          }
        }
      } else {
        // Sign in mode
        await signInWithEmail(authEmail.trim(), authPassword);
        if (diagnostic) {
          writeUserDiagnostic(null, diagnostic);
        }
        setAuthSuccess('¡Sesión iniciada! Tu avance se ha sincronizado.');
        setTimeout(() => {
          setShowSaveModal(false);
          navigate('/dashboard');
        }, 1200);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Error en la autenticación.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    if (!authEmail.trim()) {
      setAuthError('Escribe tu correo electrónico para enviarte el enlace de acceso directo.');
      return;
    }
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      await signInWithMagicLink(authEmail.trim());
      setAuthSuccess(`Enlace mágico enviado a ${authEmail.trim()}. Revisa tu bandeja de entrada o spam para entrar en 1 clic.`);
    } catch (err: any) {
      setAuthError(err?.message || 'No se pudo enviar el enlace.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  if (!diagnostic) {
    return (
      <main className="min-h-screen bg-dark-bg text-white flex items-center justify-center p-6">
        <section className="max-w-md text-center bg-dark-secondary/80 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl">
          <Compass className="w-12 h-12 text-electric-blue mx-auto mb-4 animate-spin-slow" />
          <h1 className="text-2xl font-bold">Tu ruta todavía no se ha generado</h1>
          <p className="mt-3 text-gray-400 text-sm">Responde unas preguntas breves para que la IA diseñe tu hoja de ruta personalizada.</p>
          <button onClick={() => navigate('/?start=diagnostic')} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-electric-blue to-violet px-5 py-3.5 font-bold shadow-lg shadow-violet-500/20">
            Comenzar Diagnóstico IA 🚀
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark-bg text-white relative pb-20">
      {/* Luces decorativas */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-electric-blue rounded-full mix-blend-screen filter blur-[150px] opacity-15 pointer-events-none" />

      {/* Header superior */}
      <header className="border-b border-gray-800/80 bg-dark-secondary/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-electric-blue">
              <Sparkles className="w-3.5 h-3.5" />
              Plan de Crecimiento Generado por IA
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              {profile.nombre ? `Ruta de Escalabilidad para ${profile.nombre}` : 'Tu Ruta Estratégica'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {hasRegisteredAccount ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-electric-blue/15 border border-electric-blue/40 text-electric-blue font-bold text-xs hover:bg-electric-blue hover:text-white transition-all"
              >
                <span>Ir al Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-electric-blue to-violet text-white font-bold text-xs shadow-lg shadow-violet-500/20 hover:opacity-95 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Guardar mi avance</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Pestañas de Navegación Suave (Tabs Deslizables) */}
      <div className="mx-auto max-w-6xl px-5 pt-6">
        <div className="flex border-b border-gray-800 gap-2 sm:gap-4 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === 'roadmap' ? 'text-electric-blue bg-electric-blue/10' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Hoja de Ruta Paso a Paso</span>
            {activeTab === 'roadmap' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-blue rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diagnosis')}
            className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === 'diagnosis' ? 'text-electric-blue bg-electric-blue/10' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>2. Diagnóstico y Reto Detectado</span>
            {activeTab === 'diagnosis' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-blue rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workshop')}
            className={`flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === 'workshop' ? 'text-electric-blue bg-electric-blue/10' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>3. Tu Primer Micro-Taller</span>
            {activeTab === 'workshop' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-blue rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Contenido Dinámico con Transiciones de Tarjeta */}
      <div className="mx-auto max-w-6xl px-5 pt-8">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOJA DE RUTA */}
          {activeTab === 'roadmap' && (
            <motion.div
              key="tab-roadmap"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-secondary/60 backdrop-blur-xl border border-gray-800 p-5 rounded-2xl">
                <div>
                  <h2 className="text-xl font-bold text-white">Tu Ruta de Crecimiento Secuencial</h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Desliza horizontalmente o usa las flechas para explorar cada fase estratégica diseñada para tu negocio.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-xs font-semibold tabular-nums text-gray-400">
                    Fase {activePhase + 1} de {diagnostic.scalabilityRoadmap.length}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveRoute(-1)}
                      disabled={activePhase === 0}
                      className="p-2 rounded-xl bg-dark-tertiary border border-gray-700 text-white disabled:opacity-30 hover:bg-gray-700 transition"
                      aria-label="Fase anterior"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRoute(1)}
                      disabled={activePhase >= diagnostic.scalabilityRoadmap.length - 1}
                      className="p-2 rounded-xl bg-dark-tertiary border border-gray-700 text-white disabled:opacity-30 hover:bg-gray-700 transition"
                      aria-label="Siguiente fase"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Carrusel Deslizable de Fases */}
              <div
                ref={routeTrackRef}
                onScroll={updateActivePhase}
                className="flex w-full snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth"
              >
                {diagnostic.scalabilityRoadmap.map((phase, index) => {
                  const isCurrent = index === activePhase;
                  return (
                    <motion.article
                      key={`${phase.phase}-${index}`}
                      whileHover={{ y: -4 }}
                      onClick={() => setActivePhase(index)}
                      className={`min-w-[280px] sm:min-w-[340px] max-w-[380px] shrink-0 snap-start rounded-2xl border p-6 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-b from-dark-secondary to-dark-tertiary/70 border-electric-blue/70 shadow-xl shadow-electric-blue/10'
                          : 'bg-dark-secondary/60 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                          isCurrent ? 'bg-electric-blue text-white shadow-md' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {index + 1}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          phase.priority === 'high'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : phase.priority === 'medium'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}>
                          Prioridad {phase.priority}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 leading-tight">{phase.phase}</h3>
                      <p className="text-sm text-gray-300 leading-relaxed line-clamp-4 mb-4">
                        {compactPhaseDescription(phase.description)}
                      </p>

                      {index === 0 && (
                        <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            Punto de arranque
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('workshop');
                            }}
                            className="text-xs font-bold text-electric-blue hover:underline inline-flex items-center gap-1"
                          >
                            Ir al taller →
                          </button>
                        </div>
                      )}
                    </motion.article>
                  );
                })}
              </div>

              {/* Banner de acción / Guardado */}
              <div className="bg-gradient-to-r from-violet-900/40 via-dark-secondary to-electric-blue/10 border border-violet-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <h3 className="text-xl font-bold text-white">¿Listo para comenzar a ejecutar este plan?</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {hasRegisteredAccount 
                      ? 'Tu avance está guardado. Entra a tu dashboard para desbloquear las lecciones interactivas.' 
                      : 'Crea tu cuenta gratis en 10 segundos para no perder tu ruta y ver el dashboard completo.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => hasRegisteredAccount ? navigate('/dashboard') : setShowSaveModal(true)}
                  className="shrink-0 px-6 py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-violet text-white font-bold text-sm shadow-lg shadow-violet-500/30 hover:opacity-95 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{hasRegisteredAccount ? 'Ir a mi Dashboard' : 'Crear Cuenta y Guardar Avance'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DIAGNÓSTICO DETALLADO */}
          {activeTab === 'diagnosis' && (
            <motion.div
              key="tab-diagnosis"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 bg-dark-secondary/60 backdrop-blur-xl border border-gray-800 p-6 sm:p-8 rounded-2xl space-y-5">
                <span className="text-xs font-bold uppercase tracking-wider text-electric-blue">Análisis de Situación Actual</span>
                <h2 className="text-2xl font-black text-white">{diagnostic.businessType}</h2>
                <div className="p-4 rounded-xl bg-dark-tertiary/60 border border-gray-700/60">
                  <p className="text-xs font-semibold text-gray-400 mb-1">Diagnóstico Ejecutivo:</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{diagnostic.executiveSummary || diagnostic.mainChallenge}</p>
                </div>

                <div className="pt-2">
                  <h3 className="text-base font-bold text-white mb-2">Desafío Principal a Superar:</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{diagnostic.mainChallenge}</p>
                </div>
              </div>

              <div className="bg-dark-secondary/60 backdrop-blur-xl border border-gray-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Módulos Sugeridos</h3>
                  <p className="text-xs text-gray-400 mb-4">Áreas estratégicas recomendadas para tu negocio:</p>
                  <div className="space-y-2">
                    {(diagnostic.recommendedModules || ['management', 'marketing', 'sales']).map((mod, idx) => {
                      const modArea = BUSINESS_AREAS.find(a => a.id === mod);
                      return (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-tertiary/50 border border-gray-700/50">
                          <CheckCircle2 className="w-4 h-4 text-electric-blue shrink-0" />
                          <span className="text-xs font-semibold text-white">{modArea?.name || mod}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => hasRegisteredAccount ? navigate('/dashboard') : setShowSaveModal(true)}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-violet text-white text-xs font-bold shadow-md hover:opacity-95 transition"
                >
                  Acceder a los módulos en el Dashboard →
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: PRIMER TALLER PRÁCTICO */}
          {activeTab === 'workshop' && (
            <motion.div
              key="tab-workshop"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto bg-dark-secondary/70 backdrop-blur-2xl border border-electric-blue/30 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-electric-blue">
                  Primer Taller · Área {area?.name || 'Estratégica'}
                </span>
                {currentProgress?.completed && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completado
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {firstPhase?.phase || 'Define tu primer paso estratégico'}
                </h2>
                <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                  {firstPhase?.description || diagnostic.mainChallenge}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-dark-bg/80 border border-gray-800 space-y-3">
                <label className="block text-sm font-bold text-white">
                  Tu compromiso para esta semana:
                </label>
                <p className="text-xs text-gray-400">
                  Escribe una acción pequeña pero concreta que puedas realizar en los próximos días para empezar a notar avances:
                </p>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={3}
                  placeholder={`Ejemplo: ${firstPhase?.description || 'Dedicar 1 hora el jueves para ordenar mis costos y precios.'}`}
                  className="w-full p-3.5 rounded-xl bg-dark-secondary border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue text-sm resize-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => saveWorkshopAction(true)}
                    className="px-5 py-2.5 rounded-xl bg-electric-blue text-white font-bold text-xs hover:bg-electric-blue/90 transition shadow-md"
                  >
                    {currentProgress?.completed ? 'Actualizar compromiso' : 'Guardar y completar taller'}
                  </button>

                  <button
                    type="button"
                    onClick={() => hasRegisteredAccount ? navigate('/dashboard') : setShowSaveModal(true)}
                    className="text-xs text-cyan-300 hover:underline font-semibold"
                  >
                    Guardar todo e ir a mi Dashboard →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* MODAL INTEGRADO PARA CREAR CUENTA O GUARDAR AVANCE SIN SALIR */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-dark-secondary border border-gray-700/80 p-6 sm:p-8 rounded-3xl shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-electric-blue to-violet flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/20">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  {modalMode === 'signin' ? 'Inicia sesión para vincular tu progreso' : 'Crea una cuenta y guarda tu progreso'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Así puedes continuar desde cualquier dispositivo sin perder tu diagnóstico ni tu ruta.
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAccountSubmit} className="space-y-3.5">
                {modalMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Tu nombre</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={e => setAuthName(e.target.value)}
                        placeholder="Tu nombre"
                        className="w-full pl-10 pr-3 py-2.5 bg-dark-bg border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-blue"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-dark-bg border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-3 py-2.5 bg-dark-bg border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-electric-blue"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-blue to-violet text-white font-bold text-sm shadow-lg shadow-violet-500/25 hover:opacity-95 transition disabled:opacity-50 mt-2"
                >
                  {authSubmitting ? 'Guardando...' : modalMode === 'signin' ? 'Entrar y sincronizar mi avance' : 'Crear cuenta y sincronizar mi avance'}
                </button>
              </form>

              {/* Botón de acceso sin contraseña (Magic Link) */}
              <div className="mt-4 pt-3 border-t border-gray-800 text-center">
                <button
                  type="button"
                  disabled={authSubmitting}
                  onClick={handleMagicLink}
                  className="text-xs text-gray-300 hover:text-cyan-300 inline-flex items-center gap-1.5 transition"
                >
                  <Key className="w-3.5 h-3.5" />
                  ¿No recuerdas tu contraseña? Enviarme enlace de 1 clic al correo
                </button>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setModalMode(modalMode === 'signin' ? 'signup' : 'signin');
                    }}
                    className="text-xs text-violet-400 hover:text-violet-300 hover:underline"
                  >
                    {modalMode === 'signin' ? '¿Aún no tienes cuenta? Crear una nueva' : '¿Ya tienes cuenta? Entrar aquí'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default GuestJourneyPage;