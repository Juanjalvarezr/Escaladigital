import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import { BUSINESS_AREAS, MODULE_CATALOG } from '../types';
import { supabase } from '../supabase';
import { LESSONS_PER_MODULE, QUIZZES_PER_MODULE } from '../data/courseConfig';

interface ModuleProgress {
  id: string;
  title: string;
  description: string;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
}

const AreaPage: React.FC = () => {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [area] = useState(BUSINESS_AREAS.find(a => a.id === areaId));
  const [modules, setModules] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!area) {
      navigate('/dashboard');
      return;
    }

    const loadModulesProgress = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout loading progress')), 5000);
        });

        const progressPromise = supabase
          .from('user_progress')
          .select('module_id, completion_percentage, lessons_completed, status')
          .eq('user_id', user.id);

        const { data: realProgressData, error } = await Promise.race([
          progressPromise,
          timeoutPromise
        ]) as any;

        if (error || error instanceof Error) {
          const areaModules = MODULE_CATALOG[area.id as keyof typeof MODULE_CATALOG] || [];
          setModules(areaModules.map(module => ({
            id: module.id,
            title: module.name,
            description: module.description,
            completedLessons: 0,
            totalLessons: LESSONS_PER_MODULE,
            completedQuizzes: 0,
            totalQuizzes: QUIZZES_PER_MODULE,
          })));
          setLoading(false);
          return;
        }

        const moduleProgressMap = new Map();
        realProgressData?.forEach((progress: any) => {
          moduleProgressMap.set(progress.module_id, progress);
        });

        const areaModules = MODULE_CATALOG[area.id as keyof typeof MODULE_CATALOG] || [];
        const modulesWithProgress: ModuleProgress[] = areaModules.map(module => {
          const cloudData = moduleProgressMap.get(module.id);
          let completedLessonsCount = Array.isArray(cloudData?.lessons_completed) ? cloudData.lessons_completed.length : 0;
          let completedQuiz = (Number(cloudData?.completion_percentage) || 0) >= 60 ? 1 : 0;

          try {
            const stored = window.localStorage.getItem(`escala:progress:${user.id}:${module.id}`);
            if (stored) {
              const parsed = JSON.parse(stored);
              const localLessonsCount = Array.isArray(parsed.lessons_completed) ? parsed.lessons_completed.length : 0;
              if (localLessonsCount > completedLessonsCount) {
                completedLessonsCount = localLessonsCount;
              }
              if (Number(parsed.completion_percentage) >= 60) {
                completedQuiz = 1;
              }
            }
          } catch {}

          return {
            id: module.id,
            title: module.name,
            description: module.description,
            completedLessons: completedLessonsCount,
            totalLessons: LESSONS_PER_MODULE,
            completedQuizzes: completedQuiz,
            totalQuizzes: QUIZZES_PER_MODULE,
          };
        });

        setModules(modulesWithProgress);
      } catch (error) {
        const areaModules = MODULE_CATALOG[area.id as keyof typeof MODULE_CATALOG] || [];
        setModules(areaModules.map(module => ({
          id: module.id,
          title: module.name,
          description: module.description,
          completedLessons: 0,
          totalLessons: LESSONS_PER_MODULE,
          completedQuizzes: 0,
          totalQuizzes: QUIZZES_PER_MODULE,
        })));
      } finally {
        setLoading(false);
      }
    };

    loadModulesProgress();
  }, [area, areaId, navigate, user]);

  const handleModuleClick = (moduleId: string) => {
    navigate(`/area/${areaId}/module/${moduleId}`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  if (!area) return null;

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-12">
      {/* Header Premium */}
      <header className="relative bg-dark-secondary border-b border-gray-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center text-gray-400 hover:text-electric-blue transition-colors group"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
            Volver a la Torre de Control
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-4xl mr-4">{area.icon}</span>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  {area.name}
                </h1>
              </div>
              <p className="text-lg text-gray-400 max-w-2xl">{area.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <span className="w-2 h-6 bg-electric-blue rounded-full mr-3"></span>
            Módulos del Área
          </h2>
          <p className="text-gray-400">
            Completa las fases estratégicas para escalar este pilar de tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const completionPercentage = Math.round(
              ((module.completedLessons + module.completedQuizzes) / 
               (module.totalLessons + module.totalQuizzes)) * 100
            );

            return (
              <article
                key={module.id}
                className="bg-dark-secondary border border-gray-800 rounded-2xl hover:border-violet/50 hover:shadow-[0_0_20px_rgba(110,86,207,0.15)] transition-all overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-violet transition-colors">{module.title}</h3>
                    <span className="text-xs font-bold text-electric-blue bg-electric-blue/10 px-3 py-1 rounded-full uppercase tracking-wider border border-electric-blue/20">
                      {completionPercentage}%
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-6 min-h-[48px]">{module.description}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
                        <span>Lecciones Activas</span>
                        <span className="text-white">{module.completedLessons}/{module.totalLessons}</span>
                      </div>
                      <div className="w-full bg-dark-bg rounded-full h-1.5 border border-gray-800">
                        <div
                          className="bg-gradient-to-r from-electric-blue to-violet h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${(module.completedLessons / module.totalLessons) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={() => handleModuleClick(module.id)} className="w-full bg-dark-tertiary hover:bg-violet/20 text-white border border-gray-700 hover:border-violet/50 py-3 px-4 rounded-xl transition-all text-sm font-bold flex justify-center items-center group-hover:text-electric-blue">
                    {completionPercentage > 0 ? 'Continuar Plan' : 'Iniciar Plan'}
                    <span className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AreaPage;
