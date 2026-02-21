import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import CourseView from '../components/CourseView';
import { BUSINESS_AREAS } from '../types';
import { supabase } from '../supabase';

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
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!area) {
      navigate('/dashboard');
      return;
    }

    // Cargar progreso real desde Supabase
    const loadModulesProgress = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Timeout para no quedarse cargando indefinidamente
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout loading progress')), 5000);
        });

        // Obtener progreso de módulos desde Supabase
        const progressPromise = supabase
          .from('user_progress')
          .select('module_id, completion_percentage, lessons_completed, status')
          .eq('user_id', user.id);

        const { data: progressData, error: progressError } = await Promise.race([progressPromise, timeoutPromise]) as any;

        if (progressError) {
          console.error('Error loading progress:', progressError);
          throw progressError;
        }

        // Mapear progreso a módulos
        const moduleProgressMap = new Map();
        progressData?.forEach((progress: any) => {
          moduleProgressMap.set(progress.module_id, progress);
        });

        // Crear módulos con progreso real
        const modulesWithProgress: ModuleProgress[] = [
          {
            id: 'module-1',
            title: 'Fundamentos',
            description: 'Conceptos básicos y principios fundamentales',
            completedLessons: moduleProgressMap.get('module-1')?.lessons_completed?.length || 0,
            totalLessons: 5,
            completedQuizzes: moduleProgressMap.get('module-1')?.completion_percentage >= 60 ? 1 : 0,
            totalQuizzes: 2,
          },
          {
            id: 'module-2',
            title: 'Estrategias Avanzadas',
            description: 'Técnicas y estrategias para el crecimiento',
            completedLessons: moduleProgressMap.get('module-2')?.lessons_completed?.length || 0,
            totalLessons: 6,
            completedQuizzes: moduleProgressMap.get('module-2')?.completion_percentage >= 60 ? 1 : 0,
            totalQuizzes: 2,
          },
          {
            id: 'module-3',
            title: 'Implementación Práctica',
            description: 'Casos reales y aplicación práctica',
            completedLessons: moduleProgressMap.get('module-3')?.lessons_completed?.length || 0,
            totalLessons: 4,
            completedQuizzes: moduleProgressMap.get('module-3')?.completion_percentage >= 60 ? 1 : 0,
            totalQuizzes: 1,
          },
        ];

        setModules(modulesWithProgress);
      } catch (error) {
        console.error('Error loading modules:', error);
        // Fallback a módulos sin progreso
        setModules([
          {
            id: 'module-1',
            title: 'Fundamentos',
            description: 'Conceptos básicos y principios fundamentales',
            completedLessons: 0,
            totalLessons: 5,
            completedQuizzes: 0,
            totalQuizzes: 2,
          },
          {
            id: 'module-2',
            title: 'Estrategias Avanzadas',
            description: 'Técnicas y estrategias para el crecimiento',
            completedLessons: 0,
            totalLessons: 6,
            completedQuizzes: 0,
            totalQuizzes: 2,
          },
          {
            id: 'module-3',
            title: 'Implementación Práctica',
            description: 'Casos reales y aplicación práctica',
            completedLessons: 0,
            totalLessons: 4,
            completedQuizzes: 0,
            totalQuizzes: 1,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadModulesProgress();
  }, [area, areaId, navigate, user]);

  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(moduleId);
  };

  const handleBack = () => {
    if (selectedModule) {
      setSelectedModule(null);
    } else {
      navigate('/dashboard');
    }
  };

  if (selectedModule) {
    const module = modules.find(m => m.id === selectedModule);
    return (
      <CourseView 
        moduleId={selectedModule}
        moduleName={module?.title || 'Módulo'}
        onBack={handleBack}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando módulos...</p>
        </div>
      </div>
    );
  }

  if (!area) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`${area.color} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{area.name}</h1>
              <p className="text-lg opacity-90">{area.description}</p>
            </div>
            <div className="text-4xl">
              {area.icon}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Módulos de {area.name}</h2>
          <p className="text-gray-600">
            Completa los módulos en orden para dominar esta área de negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const completionPercentage = Math.round(
              ((module.completedLessons + module.completedQuizzes) / 
               (module.totalLessons + module.totalQuizzes)) * 100
            );

            return (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {completionPercentage}%
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Lecciones</span>
                        <span>{module.completedLessons}/{module.totalLessons}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(module.completedLessons / module.totalLessons) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Quizzes</span>
                        <span>{module.completedQuizzes}/{module.totalQuizzes}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(module.completedQuizzes / module.totalQuizzes) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors text-sm font-medium">
                    {completionPercentage > 0 ? 'Continuar' : 'Comenzar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AreaPage;
