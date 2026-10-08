import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from './supabase';
import { isSupabaseConfigured } from './supabase';
import { SupabaseAuthProvider, useAuth } from './components/SupabaseAuthProvider';
import { ToastContainer, ToastProvider, useToast } from './components/ToastNotification';
import { cache, preloadCriticalRoutes, measurePerformance } from './utils/performance';
import WelcomeScreen from './components/WelcomeScreen';
import UserActivityForm from './components/UserActivityForm';
import AreaModuleCarousel from './components/AreaModuleCarousel';
import AdminFeedbackPanel from './pages/AdminFeedbackPanel';
import SupabaseDiagnostic from './components/SupabaseDiagnostic';
import SupabaseModulePage from './pages/SupabaseModulePage';
import InteractiveLessonView from './components/learning/InteractiveLessonView';
import SupabaseQuizView from './components/SupabaseQuizView';
import DashboardPage from './pages/DashboardPage';
import AreaPage from './pages/AreaPage';
import ProfilePage from './pages/ProfilePage';
import IntroPage from './pages/IntroPage';
import ProcessAcademyPage from './pages/ProcessAcademyPage';
import PublicDemoPage from './pages/PublicDemoPage';
import AuthPage from './pages/AuthPage';
import TeamPage from './pages/TeamPage';
import PlatformAdminPage from './pages/PlatformAdminPage';
import PlatformAdminRoute from './components/PlatformAdminRoute';
import GuestJourneyPage from './pages/GuestJourneyPage';
import { DiagnosticResult } from './services/gemini';
import { flushLearningEventQueue, getCompanyIdForUser, recordLearningEvent } from './services/learningEvents';
import { readGuestWorkshopProgress, readUserDiagnostic, writeUserDiagnostic } from './utils/userScopedStorage';
import { NicheOnboarding } from './components/ui/NicheOnboarding';
import { BadgeNotification } from './components/ui/BadgeNotification';

const hasPendingGuestReturn = () => {
  try {
    return window.localStorage.getItem('escala:postAuthPath:v1') === '/mi-ruta';
  } catch {
    return false;
  }
};

const hasSavedGuestJourney = () => Boolean(readUserDiagnostic<DiagnosticResult>(null));

const AppContent: React.FC = () => {
  const { user, loading, signInAnonymous, authError } = useAuth();
  const isRegisteredUser = Boolean(user?.email && !user.id.startsWith('guest_'));
  const navigate = useNavigate();
  const location = useLocation();
  const [theme] = useState<string>(() => {
    try {
      return window.localStorage.getItem('escala:theme:v1') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const { success, error } = useToast();
  const claimedUserRef = React.useRef<string | null>(null);
  const [step, setStep] = useState<'welcome' | 'form' | 'generating' | 'result' | 'app'>(
    () => {
      if (location.pathname !== '/') return 'app';
      try {
        if (hasSavedGuestJourney()) return 'app';
        return window.localStorage.getItem('escala:userProfile:v1') || new URLSearchParams(location.search).get('start') === 'diagnostic'
          ? 'form'
          : 'welcome';
      } catch {
        return new URLSearchParams(location.search).get('start') === 'diagnostic' ? 'form' : 'welcome';
      }
    }
  );
  const [userData, setUserData] = useState<{
    nombre: string;
    actividad: string;
    intereses: string;
    companyName?: string;
    employees?: string;
    learningArea?: string | string[];
    description?: string;
    goals?: string;
  } | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [generatingError, setGeneratingError] = useState<string | null>(null);

  useEffect(() => {
    measurePerformance('preload-routes', preloadCriticalRoutes);
    void flushLearningEventQueue();
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') {
      setStep('app');
    } else if (new URLSearchParams(location.search).get('start') === 'diagnostic') {
      setStep('form');
    } else if (hasSavedGuestJourney() || isRegisteredUser) {
      setStep('app');
    } else {
      try {
        if (window.localStorage.getItem('escala:userProfile:v1')) setStep('form');
      } catch {
        // The welcome screen remains available when browser storage is unavailable.
      }
    }
  }, [location.pathname, location.search, isRegisteredUser]);


  const authErrorShownRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (authError && authError !== authErrorShownRef.current) {
      authErrorShownRef.current = authError;
      error('Modo Local Resiliente', 'Operando con almacenamiento local');
    }
  }, [authError]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cleanup = setInterval(() => {
      cache.cleanup();
    }, 10 * 60 * 1000); // Cada 10 minutos

    return () => clearInterval(cleanup);
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured && !loading && !user) {
      signInAnonymous();
    }
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user?.email || user.id.startsWith('guest_') || claimedUserRef.current === user.id) return;

    const guestDiagnostic = readUserDiagnostic<DiagnosticResult>(null);
    const guestWorkshop = readGuestWorkshopProgress();
    let profile: Record<string, any> = {};
    try {
      profile = JSON.parse(window.localStorage.getItem('escala:userProfile:v1') || '{}');
    } catch {
      profile = {};
    }
    if (!guestDiagnostic && !guestWorkshop && Object.keys(profile).length === 0) return;

    claimedUserRef.current = user.id;
    void (async () => {
      let syncFailed = false;
      if (guestDiagnostic) {
        writeUserDiagnostic(user.id, guestDiagnostic);
        try {
          const { data: existing } = await supabase
            .from('user_diagnostics')
            .select('business_type, main_challenge')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (existing?.business_type !== guestDiagnostic.businessType || existing?.main_challenge !== guestDiagnostic.mainChallenge) {
            const { error: diagnosticError } = await supabase.from('user_diagnostics').insert({
              user_id: user.id,
              business_type: guestDiagnostic.businessType || profile.businessType || 'Negocio',
              main_challenge: guestDiagnostic.mainChallenge || profile.goals || 'Crecimiento',
              business_description: profile.description || profile.offer || guestDiagnostic.businessType || 'Diagnóstico visitante',
              executive_summary: guestDiagnostic.executiveSummary || null,
              generation_source: guestDiagnostic.generationSource || 'fallback',
              scalability_roadmap: guestDiagnostic.scalabilityRoadmap || [],
              recommended_modules: guestDiagnostic.recommendedModules || [],
              created_at: new Date().toISOString()
            });
            if (diagnosticError) syncFailed = true;
          }
        } catch (claimError) {
          syncFailed = true;
          console.warn('No se pudo reclamar el diagnóstico visitante', claimError);
        }
      }

      if (Object.keys(profile).length > 0) {
        try {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: profile.nombre || user.user_metadata?.display_name || null,
            company: profile.companyName || null,
            industry: profile.industry || null,
            employees_count: profile.employees || null,
            business_description: profile.description || profile.offer || null,
            goals: profile.goals || null,
            updated_at: new Date().toISOString()
          });
          if (profileError) syncFailed = true;
        } catch (claimError) {
          syncFailed = true;
          console.warn('No se pudo reclamar el perfil visitante', claimError);
        }
      }

      if (guestWorkshop) {
        try {
          const { data: existing } = await supabase
            .from('user_progress')
            .select('lessons_completed')
            .eq('user_id', user.id)
            .eq('module_id', guestWorkshop.moduleId)
            .maybeSingle();
          const lessonsCompleted = Array.from(new Set([
            ...(Array.isArray(existing?.lessons_completed) ? existing?.lessons_completed || [] : []),
            ...(guestWorkshop.completed ? [guestWorkshop.lessonId] : [])
          ]));
          const { error: progressError } = await supabase.from('user_progress').upsert({
            user_id: user.id,
            module_id: guestWorkshop.moduleId,
            status: guestWorkshop.completed ? 'completed' : 'in_progress',
            completion_percentage: guestWorkshop.completed ? 100 : 25,
            lessons_completed: lessonsCompleted,
            last_accessed: guestWorkshop.updatedAt,
            updated_at: guestWorkshop.updatedAt
          }, { onConflict: 'user_id,module_id' });
          if (progressError) syncFailed = true;
        } catch (claimError) {
          syncFailed = true;
          console.warn('No se pudo reclamar el progreso visitante', claimError);
        }
      }

      if (!syncFailed) {
        try {
          window.localStorage.removeItem('escala:postAuthPath:v1');
        } catch {
          // Keep local recovery data if storage is unavailable.
        }
      }
    })();
  }, [user?.email, user?.id, user?.user_metadata?.display_name]);

  // Apply theme to document
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      window.localStorage.setItem('escala:theme:v1', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Paso 3: Generando ruta IA (efecto en vez de IIFE en render)
  useEffect(() => {
    if (step !== 'generating') return;
    let mounted = true;
    setGeneratingError(null);

    (async () => {
      try {
        const { GeminiService } = await import('./services/gemini');
        const service = new GeminiService();
        const result = await service.analyzeBusiness(userData || {});

        if (!mounted) return;
        setDiagnosticResult(result);
        writeUserDiagnostic(null, result);
        if (user?.email && !user.id.startsWith('guest_')) writeUserDiagnostic(user.id, result);

        if (user?.email && !user.id.startsWith('guest_')) {
          void supabase
            .from('user_diagnostics')
            .insert({
              user_id: user.id,
              business_type: result.businessType,
              main_challenge: result.mainChallenge,
              business_description: userData?.description || null,
              executive_summary: result.executiveSummary || null,
              generation_source: result.generationSource || 'ai',
              scalability_roadmap: result.scalabilityRoadmap,
              recommended_modules: result.recommendedModules,
              created_at: new Date().toISOString()
            })
            .then(({ error: persistError }) => {
              if (persistError) console.warn('Diagnóstico conservado localmente; falló su sincronización', persistError);
            });

          void recordLearningEvent({
            companyId: getCompanyIdForUser(user),
            userId: user.id,
            eventType: 'diagnostic_completed',
            eventProperties: {
              businessType: result.businessType,
              mainChallenge: result.mainChallenge,
              recommendedModules: result.recommendedModules
            }
          });
        }

        success('¡Ruta generada!', 'Tu plan ya está listo. Empieza con el primer taller.');
        setStep('app');
        navigate('/mi-ruta');
      } catch (e: any) {
        console.error('Error generating diagnostic:', e);
        if (!mounted) return;
        setGeneratingError(e?.message || 'Error al generar la ruta');
        error('Error IA', 'No se pudo generar la ruta. Intenta de nuevo.');
        setStep('form');
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Paso 1: Pantalla de bienvenida
  if (step === 'welcome') {
    return <WelcomeScreen onContinue={() => setStep('form')} onSkip={() => setStep('app')} />;
  }

  // Paso 2: Formulario usuario/actividad
  if (step === 'form') {
    // Try to prefill from localStorage so the user can complete incrementally
    let initial = undefined;
    try {
      const stored = window.localStorage.getItem('escala:userProfile:v1');
      if (stored) initial = JSON.parse(stored);
    } catch (e) {
      initial = undefined;
    }

    return <UserActivityForm initial={initial} onSubmit={data => { setUserData(data); setStep('generating'); }} />;
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-300">Generando ruta personalizada...</p>
          {generatingError ? (
            <p className="text-red-400 mt-4">{generatingError}</p>
          ) : null}
        </div>
      </div>
    );
  }

  // Paso 4: Mostrar ruta generada
  if (step === 'result' && diagnosticResult) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex flex-col items-center p-4">
        {/* Banner superior */}
        <div className="w-full max-w-md bg-dark-secondary rounded-xl shadow-lg py-6 px-4 mb-6 flex flex-col items-center border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-2">Ruta personalizada para {userData?.nombre}</h2>
          <p className="text-gray-300 text-sm">{diagnosticResult.businessType} - {diagnosticResult.mainChallenge}</p>
        </div>
        {/* Carrusel de módulos compactos */}
        <div className="w-full max-w-md mb-8">
          <AreaModuleCarousel items={diagnosticResult.scalabilityRoadmap} />
        </div>
        {/* Botón para generar otra ruta */}
        <button
          className="w-full max-w-md px-6 py-3 bg-gradient-to-r from-electric-blue to-violet text-white rounded-lg shadow hover:opacity-90 transition mt-4"
          onClick={() => setStep('form')}
        >
          Generar otra ruta
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Global UX overlays */}
      {user && <NicheOnboarding />}
      <BadgeNotification />

      <Routes>
        <Route path="/demo" element={<PublicDemoPage />} />
        <Route path="/mi-ruta" element={<GuestJourneyPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/diagnostic" element={isRegisteredUser ? <SupabaseDiagnostic onComplete={() => {}} /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={isRegisteredUser ? <DashboardPage /> : <Navigate to={hasSavedGuestJourney() ? '/mi-ruta' : '/'} />} />
        <Route path="/academia-procesos" element={isRegisteredUser ? <ProcessAcademyPage /> : <Navigate to="/" />} />
        <Route path="/area/:areaId" element={isRegisteredUser ? <AreaPage /> : <Navigate to={hasSavedGuestJourney() ? '/mi-ruta' : '/'} />} />
        <Route path="/module/:moduleId" element={<LegacyModuleRoute />} />
        <Route path="/module/:moduleId/lesson/:lessonId" element={<LegacyLessonRoute />} />
        <Route path="/area/:areaId/module/:moduleId" element={isRegisteredUser ? <SupabaseModulePage /> : <Navigate to="/auth?next=%2Fdashboard" />} />
        <Route path="/area/:areaId/module/:moduleId/lesson/:lessonId" element={isRegisteredUser ? <LessonViewWrapper /> : <Navigate to="/auth?next=%2Fdashboard" />} />
        <Route path="/area/:areaId/module/:moduleId/quiz" element={isRegisteredUser ? <QuizViewWrapper /> : <Navigate to="/auth?next=%2Fdashboard" />} />
        <Route path="/profile" element={isRegisteredUser ? <ProfilePage /> : <Navigate to="/auth?next=%2Fdashboard" />} />
        <Route path="/team" element={isRegisteredUser ? <TeamPage /> : <Navigate to="/auth?next=%2Fteam" />} />
        <Route path="/platform-admin" element={<PlatformAdminRoute><PlatformAdminPage /></PlatformAdminRoute>} />

        <Route path="/admin-feedback" element={<PlatformAdminRoute><AdminFeedbackPanel /></PlatformAdminRoute>} />
        <Route path="/" element={loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : isRegisteredUser ? (
          <Navigate to={hasPendingGuestReturn() ? '/mi-ruta' : '/dashboard'} />
        ) : hasSavedGuestJourney() ? (
          <Navigate to="/mi-ruta" />
        ) : (
          <IntroPage />
        )} />
      </Routes>
      {/* Contenedor de notificaciones toast */}
      <ToastContainer />
    </div>
  );
};

const LessonViewWrapper = () => {
  const { areaId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  if (!moduleId || !lessonId || !areaId) return <Navigate to="/dashboard" replace />;

  const currentNum = Number(lessonId.replace(/\D/g, '')) || 1;

  return (
    <InteractiveLessonView 
      areaId={areaId}
      moduleId={moduleId} 
      lessonId={lessonId} 
      onComplete={() => navigate(`/area/${areaId}/module/${moduleId}`)} 
      onNext={() => navigate(`/area/${areaId}/module/${moduleId}/lesson/lesson-${currentNum + 1}`)} 
      onPrevious={() => currentNum > 1 ? navigate(`/area/${areaId}/module/${moduleId}/lesson/lesson-${currentNum - 1}`) : navigate(`/area/${areaId}/module/${moduleId}`)} 
      hasNext={currentNum < 5} 
      hasPrevious={currentNum > 1} 
    />
  );
};

const QuizViewWrapper = () => {
  const { areaId, moduleId } = useParams();
  const navigate = useNavigate();

  if (!moduleId || !areaId) return <Navigate to="/dashboard" replace />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(`/area/${areaId}/module/${moduleId}`)}
        className="mb-6 flex items-center text-xs font-bold text-gray-400 hover:text-white transition-colors"
      >
        ← Volver al Módulo
      </button>
      <SupabaseQuizView
        moduleId={moduleId}
        onComplete={() => navigate(`/area/${areaId}/module/${moduleId}`)}
        onRetry={() => {}}
      />
    </div>
  );
};

const LegacyModuleRoute = () => {
  const { moduleId } = useParams();
  const targetAreaId = moduleId?.split('-')[0] || 'management';

  return <Navigate to={moduleId ? `/area/${targetAreaId}/module/${moduleId}` : '/dashboard'} replace />;
};

const LegacyLessonRoute = () => {
  const { moduleId, lessonId } = useParams();
  const targetAreaId = moduleId?.split('-')[0] || 'management';

  return <Navigate to={moduleId && lessonId ? `/area/${targetAreaId}/module/${moduleId}/lesson/${lessonId}` : '/dashboard'} replace />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <SupabaseAuthProvider>
          <Router>
            <AppContent />
          </Router>
        </SupabaseAuthProvider>
      </QueryClientProvider>
    </ToastProvider>
  );
};

export default App;
