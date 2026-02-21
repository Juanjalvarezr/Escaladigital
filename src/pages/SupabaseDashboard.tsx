import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import { ModuleSidebar } from '../components/ModuleNavigation';
import { BUSINESS_AREAS } from '../types';
import { supabase } from '../supabase';

interface ModuleProgress {
  moduleId: string;
  completionPercentage: number;
  status: 'not_started' | 'in_progress' | 'completed';
  quizScore?: number;
}

interface LatestDiagnostic {
  businessType: string | null;
  mainChallenge: string | null;
  scalabilityRoadmap: Array<{ phase: string; description: string; priority: 'high' | 'medium' | 'low' }>;
  recommendedModules: string[];
  createdAt: string;
}

export const SupabaseDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modulesProgress, setModulesProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestDiagnostic, setLatestDiagnostic] = useState<LatestDiagnostic | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadModulesProgress();
      loadLatestDiagnostic();
    }
  }, [user]);

  const loadLatestDiagnostic = async () => {
    if (!user) return;
    setDiagnosticLoading(true);

    try {
      const { data, error } = await supabase
        .from('user_diagnostics')
        .select('business_type, main_challenge, scalability_roadmap, recommended_modules, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading latest diagnostic:', error);
        return;
      }

      if (!data) {
        setLatestDiagnostic(null);
        return;
      }

      setLatestDiagnostic({
        businessType: data.business_type,
        mainChallenge: data.main_challenge,
        scalabilityRoadmap: data.scalability_roadmap || [],
        recommendedModules: data.recommended_modules || [],
        createdAt: data.created_at
      });

      try {
        window.localStorage.setItem(
          'escala:latestDiagnosticResult:v1',
          JSON.stringify({
            businessType: data.business_type,
            mainChallenge: data.main_challenge,
            scalabilityRoadmap: data.scalability_roadmap || [],
            recommendedModules: data.recommended_modules || []
          })
        );
      } catch {
        // ignore
      }
    } catch (error) {
      console.error('Error loading latest diagnostic:', error);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleRedoDiagnostic = () => {
    try {
      window.localStorage.removeItem('escala:latestDiagnosticResult:v1');
    } catch {
      // ignore
    }

    window.location.href = '/?diagnostic=1';
  };

  const loadModulesProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading modules progress:', error);
        return;
      }

      const progressData: ModuleProgress[] = BUSINESS_AREAS.map(area => {
        const userProgress = data?.find(p => p.module_id === area.id);
        
        return {
          moduleId: area.id,
          completionPercentage: userProgress?.completion_percentage || 0,
          status: userProgress?.status || 'not_started',
          quizScore: userProgress?.quiz_score
        };
      });

      setModulesProgress(progressData);
    } catch (error) {
      console.error('Error loading modules progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallProgress = () => {
    if (modulesProgress.length === 0) return 0;
    const totalProgress = modulesProgress.reduce((sum, module) => sum + module.completionPercentage, 0);
    return Math.round(totalProgress / modulesProgress.length);
  };

  const getCompletedModules = () => {
    return modulesProgress.filter(module => module.status === 'completed').length;
  };

  const handleModuleClick = (moduleId: string) => {
    navigate(`/module/${moduleId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <ModuleSidebar 
        completedModules={modulesProgress.filter(m => m.status === 'completed').map(m => m.moduleId)}
      />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Bienvenido, {user?.user_metadata?.name || user?.email || 'Emprendedor'}
            </h1>
            <p className="text-gray-400">
              Tu camino hacia la transformación digital continúa
            </p>
          </div>

          {/* Learning Path (Latest Diagnostic) */}
          <div className="mb-8">
            <div className="bg-dark-secondary rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Tu Ruta de Aprendizaje</h2>
                {diagnosticLoading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet"></div>
                )}
              </div>

              <button
                type="button"
                onClick={handleRedoDiagnostic}
                className="mb-4 px-3 py-2 rounded-lg border border-gray-600 text-gray-200 hover:bg-gray-700/50 transition-colors text-sm"
              >
                Rehacer diagnóstico
              </button>

              {!latestDiagnostic ? (
                <p className="text-gray-400">
                  Aún no has generado tu ruta. Completa el diagnóstico para que la IA cree tu plan.
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-tertiary rounded-lg p-4 border border-gray-600">
                      <div className="text-sm text-gray-400 mb-1">Industria</div>
                      <div className="text-white font-medium">{latestDiagnostic.businessType || '—'}</div>
                    </div>
                    <div className="bg-dark-tertiary rounded-lg p-4 border border-gray-600">
                      <div className="text-sm text-gray-400 mb-1">Desafío principal</div>
                      <div className="text-white font-medium">{latestDiagnostic.mainChallenge || '—'}</div>
                    </div>
                  </div>

                  {latestDiagnostic.recommendedModules.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Módulos recomendados</div>
                      <div className="flex flex-wrap gap-2">
                        {latestDiagnostic.recommendedModules.map((moduleId) => {
                          const area = BUSINESS_AREAS.find(a => a.id === moduleId);
                          return (
                            <button
                              key={moduleId}
                              onClick={() => navigate(`/module/${moduleId}`)}
                              className="px-3 py-1.5 rounded-full bg-violet/15 border border-violet/30 text-violet hover:bg-violet/25 transition-colors text-sm"
                            >
                              {area ? area.name : moduleId}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {latestDiagnostic.scalabilityRoadmap.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Roadmap sugerido</div>
                      <div className="space-y-3">
                        {latestDiagnostic.scalabilityRoadmap.map((item, idx) => (
                          <div key={`${item.phase}-${idx}`} className="bg-dark-tertiary rounded-lg p-4 border border-gray-600">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-white font-semibold">{item.phase}</div>
                                <div className="text-gray-300 text-sm mt-1">{item.description}</div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                item.priority === 'high'
                                  ? 'bg-red-500/10 text-red-300 border-red-500/30'
                                  : item.priority === 'medium'
                                    ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
                                    : 'bg-green-500/10 text-green-300 border-green-500/30'
                              }`}>
                                {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Baja'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-dark-secondary rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Progreso General</span>
                <svg className="w-8 h-8 text-violet" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h-.5a1 1 0 000-2H8a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{getOverallProgress()}%</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-violet to-electric-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getOverallProgress()}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-dark-secondary rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Módulos Completados</span>
                <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {getCompletedModules()} / {BUSINESS_AREAS.length}
              </div>
              <p className="text-gray-400 text-sm">Áreas dominadas</p>
            </div>

            <div className="bg-dark-secondary rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Nivel Actual</span>
                <svg className="w-8 h-8 text-electric-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {getOverallProgress() < 25 ? 'Principiante' : 
                 getOverallProgress() < 50 ? 'Intermedio' : 
                 getOverallProgress() < 75 ? 'Avanzado' : 'Experto'}
              </div>
              <p className="text-gray-400 text-sm">Tu nivel de escala</p>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BUSINESS_AREAS.map((area) => {
              const progress = modulesProgress.find(p => p.moduleId === area.id);
              const isCompleted = progress?.status === 'completed';
              const progressPercentage = progress?.completionPercentage || 0;

              return (
                <button
                  key={area.id}
                  onClick={() => handleModuleClick(area.id)}
                  className="bg-dark-secondary rounded-xl p-6 border border-gray-700 hover:border-violet/50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{area.icon}</span>
                    {isCompleted && (
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet transition-colors">
                    {area.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {isCompleted ? 'Completado' : 
                     progressPercentage > 0 ? 'En progreso' : 'No iniciado'}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progreso</span>
                      <span className="text-white font-medium">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${progressPercentage}%`,
                          backgroundColor: isCompleted ? '#10B981' : area.color 
                        }}
                      ></div>
                    </div>
                  </div>

                  {progress?.quizScore && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Última evaluación</span>
                        <span className={`font-medium ${
                          progress.quizScore >= 70 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {progress.quizScore}%
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* VIP CTA */}
          {getCompletedModules() >= 3 && (
            <div className="mt-8 bg-gradient-to-r from-violet/20 to-electric-blue/20 rounded-xl p-6 border border-violet/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    ¡Estás listo para el siguiente nivel!
                  </h3>
                  <p className="text-gray-300">
                    Has completado {getCompletedModules()} módulos. Es hora de llevar tu negocio al siguiente nivel con ayuda experta.
                  </p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-violet to-electric-blue text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                  Agendar Asesoría VIP
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
