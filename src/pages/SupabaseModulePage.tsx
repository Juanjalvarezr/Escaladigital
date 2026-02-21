import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import { ModuleSidebar } from '../components/ModuleNavigation';
import { SupabaseLessonView } from '../components/SupabaseLessonView';
import { SupabaseQuizView } from '../components/SupabaseQuizView';
import { BUSINESS_AREAS } from '../types';
import { supabase } from '../supabase';
import { analytics } from '../services/analytics';

interface ModuleProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  lessonsCompleted: string[];
  quizScore?: number;
}

const SupabaseModulePage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user, session, signInWithMagicLink, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState<'overview' | 'lesson' | 'quiz'>('overview');
  const [currentLesson, setCurrentLesson] = useState(1);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const FREE_LESSONS_PER_MODULE = 2;
  const isAnonymous = Boolean((session as any)?.user?.is_anonymous);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [pendingLessonNumber, setPendingLessonNumber] = useState<number | null>(null);
  const [pendingView, setPendingView] = useState<'lesson' | 'quiz' | null>(null);

  const module = BUSINESS_AREAS.find(area => area.id === moduleId);
  const totalLessons = 5; // Fixed number of lessons per module

  useEffect(() => {
    if (!moduleId || !module) {
      navigate('/dashboard');
      return;
    }

    if (user) {
      loadModuleProgress();

      if (user.user_metadata?.defaultCompanyId) {
        analytics.trackEvent({
          companyId: user.user_metadata.defaultCompanyId,
          userId: user.id,
          eventName: 'module_open',
          eventProperties: { moduleId },
          pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
          referrer: typeof document !== 'undefined' ? document.referrer : undefined
        });
      }
    }
  }, [moduleId, user, module, navigate]);

  useEffect(() => {
    if (!user?.user_metadata?.defaultCompanyId || !moduleId) return;
    if (currentView === 'lesson') {
      analytics.trackEvent({
        companyId: user.user_metadata.defaultCompanyId,
        userId: user.id,
        eventName: 'lesson_open',
        eventProperties: { moduleId, lessonId: `lesson-${currentLesson}` },
        pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined
      });
    }
  }, [currentView, currentLesson, moduleId, user?.user_metadata?.defaultCompanyId, user?.id]);

  const canAccessLessonNumber = (lessonNumber: number) => {
    if (!isAnonymous) return true;
    return lessonNumber <= FREE_LESSONS_PER_MODULE;
  };

  const requestGateThenOpen = (view: 'lesson' | 'quiz', lessonNumber?: number) => {
    setPendingView(view);
    setPendingLessonNumber(typeof lessonNumber === 'number' ? lessonNumber : null);
    setAuthMessage(null);
    setShowAuthGate(true);
  };

  const closeGate = () => {
    setShowAuthGate(false);
    setAuthSubmitting(false);
    setAuthMessage(null);
  };

  const handleContinueAfterAuth = () => {
    if (pendingView === 'lesson' && pendingLessonNumber) {
      setCurrentLesson(pendingLessonNumber);
      setCurrentView('lesson');
    }
    if (pendingView === 'quiz') {
      setCurrentView('quiz');
    }
    setPendingView(null);
    setPendingLessonNumber(null);
    closeGate();
  };

  const loadModuleProgress = async () => {
    if (!user || !moduleId) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading module progress:', error);
        return;
      }

      if (data) {
        setModuleProgress({
          status: data.status,
          completionPercentage: data.completion_percentage,
          lessonsCompleted: data.lessons_completed || [],
          quizScore: data.quiz_score
        });
      } else {
        setModuleProgress({
          status: 'not_started',
          completionPercentage: 0,
          lessonsCompleted: []
        });
      }
    } catch (error) {
      console.error('Error loading module progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartModule = () => {
    if (!canAccessLessonNumber(1)) {
      requestGateThenOpen('lesson', 1);
      return;
    }

    setCurrentLesson(1);
    setCurrentView('lesson');
  };

  const handleContinueModule = () => {
    if (moduleProgress) {
      const nextLesson = moduleProgress.lessonsCompleted.length + 1;
      const targetLesson = nextLesson <= totalLessons ? nextLesson : totalLessons;

      if (!canAccessLessonNumber(targetLesson)) {
        requestGateThenOpen('lesson', targetLesson);
        return;
      }

      setCurrentLesson(targetLesson);
      setCurrentView('lesson');
    }
  };

  const handleLessonComplete = () => {
    // Reload progress to update UI
    loadModuleProgress();
  };

  const handleQuizComplete = (score: number) => {
    // Reload progress to update UI
    loadModuleProgress();
  };

  const handleRetryQuiz = () => {
    setCurrentView('quiz');
  };

  const handleNextLesson = () => {
    if (currentLesson < totalLessons) {
      const nextLesson = currentLesson + 1;
      if (!canAccessLessonNumber(nextLesson)) {
        requestGateThenOpen('lesson', nextLesson);
        return;
      }
      setCurrentLesson(nextLesson);
    } else {
      if (isAnonymous) {
        requestGateThenOpen('quiz');
        return;
      }

      setCurrentView('quiz');
    }
  };

  const handlePreviousLesson = () => {
    if (currentLesson > 1) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">Módulo no encontrado</p>
        </div>
      </div>
    );
  }

  if (currentView === 'lesson') {
    return (
      <div className="flex min-h-screen bg-dark-bg">
        <ModuleSidebar 
          completedModules={moduleProgress?.status === 'completed' ? [moduleId as string] : [] as string[]}
          currentModule={moduleId}
        />
        
        <main className="flex-1">
          <SupabaseLessonView
            moduleId={moduleId as string}
            lessonId={`lesson-${currentLesson}`}
            onComplete={handleLessonComplete}
            onNext={handleNextLesson}
            onPrevious={handlePreviousLesson}
            hasNext={currentLesson < totalLessons}
            hasPrevious={currentLesson > 1}
          />
        </main>
      </div>
    );
  }

  if (currentView === 'quiz') {
    return (
      <div className="flex min-h-screen bg-dark-bg">
        <ModuleSidebar 
          completedModules={moduleProgress?.status === 'completed' ? [moduleId as string] : [] as string[]}
          currentModule={moduleId}
        />
        
        <main className="flex-1">
          <SupabaseQuizView
            moduleId={moduleId as string}
            onComplete={handleQuizComplete}
            onRetry={handleRetryQuiz}
          />
        </main>
      </div>
    );
  }

  const isCompleted = moduleProgress?.status === 'completed';
  const isInProgress = moduleProgress?.status === 'in_progress';
  const completedLessons = moduleProgress?.lessonsCompleted.length || 0;

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <ModuleSidebar 
        completedModules={isCompleted ? [moduleId as string] : [] as string[]}
        currentModule={moduleId}
      />
      
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-4xl">{module.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-white">{module.name}</h1>
                <p className="text-gray-400">Domina esta área clave para tu negocio</p>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-dark-secondary rounded-xl border border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Progreso del Módulo</span>
                  <span className="text-white font-semibold">
                    {moduleProgress?.completionPercentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${moduleProgress?.completionPercentage || 0}%`,
                      backgroundColor: module.color 
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="text-gray-400 mb-1">Lecciones Completadas</div>
                <div className="text-2xl font-bold text-white">
                  {completedLessons} / {totalLessons}
                </div>
              </div>

              <div>
                <div className="text-gray-400 mb-1">Estado</div>
                <div className={`text-lg font-semibold ${
                  isCompleted ? 'text-green-400' : 
                  isInProgress ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {isCompleted ? 'Completado' : 
                   isInProgress ? 'En progreso' : 'No iniciado'}
                </div>
              </div>
            </div>
          </div>

          {/* Content Overview */}
          <div className="bg-dark-secondary rounded-xl border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Contenido del Módulo</h2>
            
            <div className="space-y-3">
              {Array.from({ length: totalLessons }, (_, index) => {
                const lessonNumber = index + 1;
                const isLessonCompleted = moduleProgress?.lessonsCompleted.includes(`lesson-${lessonNumber}` as string);
                const isCurrentLesson = lessonNumber === completedLessons + 1 && !isCompleted;
                const isLocked = lessonNumber > completedLessons + 1;

                return (
                  <div 
                    key={lessonNumber}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isLessonCompleted ? 'bg-green-500/10 border-green-500/30' :
                      isCurrentLesson ? 'bg-violet/10 border-violet/30' :
                      isLocked ? 'bg-gray-700/30 border-gray-600' :
                      'bg-dark-tertiary border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isLessonCompleted ? 'bg-green-500' :
                        isCurrentLesson ? 'bg-violet' :
                        isLocked ? 'bg-gray-600' :
                        'bg-gray-700'
                      }`}>
                        {isLessonCompleted ? (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-white text-sm font-medium">{lessonNumber}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">Lección {lessonNumber}</div>
                        <div className="text-gray-400 text-sm">
                          {isLessonCompleted ? 'Completado' :
                           isCurrentLesson ? 'Lección actual' :
                           isLocked ? 'Bloqueado' : 'Disponible'}
                        </div>
                      </div>
                    </div>
                    
                    {!isLocked && (
                      <button
                        onClick={() => {
                          if (!canAccessLessonNumber(lessonNumber)) {
                            requestGateThenOpen('lesson', lessonNumber);
                            return;
                          }
                          setCurrentLesson(lessonNumber);
                          setCurrentView('lesson');
                        }}
                        className="px-4 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 transition-colors text-sm"
                      >
                        {isLessonCompleted ? 'Repasar' : 'Comenzar'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quiz Section */}
          {completedLessons === totalLessons && (
            <div className="bg-dark-secondary rounded-xl border border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Evaluación Final</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 mb-2">
                    ¡Has completado todas las lecciones! Es hora de poner a prueba tu conocimiento.
                  </p>
                  {moduleProgress?.quizScore && (
                    <p className="text-sm text-gray-400">
                      Tu último puntaje: <span className={
                        moduleProgress.quizScore >= 70 ? 'text-green-400' : 'text-yellow-400'
                      }>{moduleProgress.quizScore}%</span>
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    if (isAnonymous) {
                      requestGateThenOpen('quiz');
                      return;
                    }
                    setCurrentView('quiz');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-violet to-electric-blue text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {moduleProgress?.quizScore ? 'Reintentar Evaluación' : 'Comenzar Evaluación'}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Volver al Dashboard
            </button>

            <div className="flex items-center space-x-3">
              {isCompleted && (
                <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
                  <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Módulo Completado
                </div>
              )}

              {!isCompleted && (
                <button
                  onClick={isInProgress ? handleContinueModule : handleStartModule}
                  className="px-6 py-3 bg-gradient-to-r from-violet to-electric-blue text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {isInProgress ? 'Continuar Aprendiendo' : 'Comenzar Módulo'}
                </button>
              )}
            </div>
          </div>

          {showAuthGate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-md rounded-xl border border-gray-700 bg-dark-secondary p-5">
                <div className="text-white font-semibold text-lg">Guarda tu progreso</div>
                <div className="mt-1 text-gray-300 text-sm">
                  Puedes explorar <span className="text-white font-medium">{FREE_LESSONS_PER_MODULE} lecciones por módulo</span> sin cuenta.
                  Para continuar y guardar tu avance, crea tu cuenta.
                </div>

                {authMessage && (
                  <div className="mt-3 rounded-lg border border-violet/30 bg-violet/10 p-3 text-sm text-violet">
                    {authMessage}
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    disabled={authSubmitting}
                    onClick={async () => {
                      try {
                        setAuthSubmitting(true);
                        await signInWithGoogle();
                        setAuthMessage('Abriendo Google... Cuando regreses, tu progreso quedará guardado.');
                      } catch (e) {
                        setAuthMessage(e instanceof Error ? e.message : 'No se pudo iniciar con Google');
                      } finally {
                        setAuthSubmitting(false);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-white text-black font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Continuar con Google
                  </button>

                  <div className="rounded-lg border border-gray-700 bg-dark-tertiary p-3">
                    <div className="text-gray-200 text-sm font-medium">O con tu correo</div>
                    <input
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="mt-2 w-full rounded-lg border border-gray-600 bg-dark-secondary px-3 py-2 text-white placeholder-gray-500"
                    />
                    <button
                      type="button"
                      disabled={authSubmitting || !authEmail.trim()}
                      onClick={async () => {
                        try {
                          setAuthSubmitting(true);
                          await signInWithMagicLink(authEmail.trim());
                          setAuthMessage('Te enviamos un link a tu correo. Ábrelo para iniciar y volver aquí.');
                        } catch (e) {
                          setAuthMessage(e instanceof Error ? e.message : 'No se pudo enviar el link');
                        } finally {
                          setAuthSubmitting(false);
                        }
                      }}
                      className="mt-3 w-full px-4 py-2 rounded-lg bg-violet text-white font-semibold hover:bg-violet/90 transition-colors disabled:opacity-50"
                    >
                      Enviar Magic Link
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={closeGate}
                    className="px-3 py-2 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-700/50 transition-colors text-sm"
                  >
                    Ahora no
                  </button>

                  <button
                    type="button"
                    onClick={handleContinueAfterAuth}
                    className="px-3 py-2 rounded-lg bg-electric-blue/20 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/30 transition-colors text-sm"
                  >
                    Ya me registré
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SupabaseModulePage;
