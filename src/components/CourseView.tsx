import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import { geminiService, LessonContent } from '../services/gemini';
import { supabase } from '../supabase';

interface CourseViewProps {
  moduleId: string;
  moduleName: string;
  onBack: () => void;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  advantages: string[];
  disadvantages: string[];
  successCases: Array<{
    company: string;
    industry: string;
    challenge: string;
    solution: string;
    results: string;
  }>;
  finalAnalysis: {
    keyTakeaways: string[];
    nextSteps: string[];
    resources: Array<{
      name: string;
      type: 'article' | 'video' | 'tool' | 'template';
      url?: string;
    }>;
  };
}

const getDifficultyColor = (difficulty: CourseModule['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
    case 'intermediate':
      return 'bg-amber-500/15 text-amber-300 border-amber-400/30';
    case 'advanced':
      return 'bg-rose-500/15 text-rose-300 border-rose-400/30';
    default:
      return 'bg-slate-500/15 text-slate-300 border-slate-400/30';
  }
};

const getResourceIcon = (type: CourseModule['finalAnalysis']['resources'][number]['type']) => {
  switch (type) {
    case 'article':
      return '📝';
    case 'video':
      return '🎥';
    case 'tool':
      return '🛠️';
    case 'template':
      return '📄';
    default:
      return '📌';
  }
};

const CourseView: React.FC<CourseViewProps> = ({ moduleId, moduleName, onBack }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courseModule, setCourseModule] = useState<CourseModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'cases' | 'analysis'>('overview');

  const handleStartModule = async () => {
    if (!user) return;

    try {
      // Inicializar progreso del módulo en Supabase
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          status: 'in_progress',
          completion_percentage: 0,
          started_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });

      if (error) {
        console.error('Error initializing module progress:', error);
      } else {
        // Registrar evento de analytics
        await supabase
          .from('user_analytics')
          .insert({
            user_id: user.id,
            event_type: 'module_started',
            module_id: moduleId,
            metadata: { source: 'course_view' }
          });

        // Navegar a la primera lección del módulo
        navigate(`/area/${moduleId.split('-')[0]}/module/${moduleId}/lesson/lesson-1`);
      }
    } catch (error) {
      console.error('Error starting module:', error);
    }
  };

  useEffect(() => {
    loadCourseModule();
  }, [moduleId]);

  const loadCourseModule = async () => {
    try {
      setLoading(true);
      
      // Simplemente usar contenido fallback sin complicaciones
      const fallbackModule = createFallbackModule(moduleName);
      setCourseModule(fallbackModule);
      
    } catch (error) {
      console.error('Error loading course module:', error);
      // Usar fallback siempre
      setCourseModule(createFallbackModule(moduleName));
    } finally {
      setLoading(false);
    }
  };

  const createFallbackModule = (name: string): CourseModule => ({
    id: moduleId,
    title: `Módulo de ${name}`,
    description: `Aprende los fundamentos y mejores prácticas de ${name} para aplicarlos en tu negocio de inmediato.`,
    duration: '3 horas',
    difficulty: 'beginner',
    objectives: [
      `Comprender los conceptos básicos de ${name}`,
      `Aplicar técnicas prácticas en tu negocio`,
      `Medir y optimizar resultados`
    ],
    advantages: [
      'Mejora inmediata de procesos',
      'Retorno de inversión rápido',
      'Fácil de implementar'
    ],
    disadvantages: [
      'Requiere dedicación inicial',
      'Necesita adaptación específica',
      'Resultados varían por industria'
    ],
    successCases: [
      {
        company: 'Tienda Local XYZ',
        industry: 'Retail',
        challenge: 'Bajas ventas y gestión ineficiente',
        solution: `Implementación de sistemas de ${name}`,
        results: 'Ventas +45% en 2 meses, eficiencia +60%'
      }
    ],
    finalAnalysis: {
      keyTakeaways: [
        `${name} es fundamental para el crecimiento`,
        'La implementación gradual da mejores resultados',
        'La medición constante es clave'
      ],
      nextSteps: [
        'Aplicar lo aprendido en tu negocio',
        'Monitorear resultados semanales',
        'Ajustar según sea necesario'
      ],
      resources: [
        {
          name: 'Guía de implementación',
          type: 'template'
        }
      ]
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!courseModule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">No se pudo cargar el módulo</p>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-12">
      {/* Header Premium */}
      <div className="bg-dark-secondary border-b border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-electric-blue rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-electric-blue transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Volver a Módulos</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getDifficultyColor(courseModule.difficulty)}`}>
                {courseModule.difficulty === 'beginner' ? 'Nivel Básico' :
                 courseModule.difficulty === 'intermediate' ? 'Nivel Intermedio' : 'Nivel Avanzado'}
              </span>
              <span className="text-gray-400 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {courseModule.duration}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Title Section */}
        <div className="bg-gradient-to-br from-dark-secondary to-dark-tertiary border border-gray-800 rounded-3xl p-10 mb-10 relative overflow-hidden shadow-[0_0_40px_rgba(110,86,207,0.15)]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet rounded-full mix-blend-screen filter blur-[120px] opacity-20 translate-x-1/3 -translate-y-1/3"></div>
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{courseModule.title}</h1>
            <p className="text-xl text-gray-400 leading-relaxed">{courseModule.description}</p>
            
            <div className="mt-8">
              <button 
                onClick={handleStartModule}
                className="px-8 py-4 bg-gradient-to-r from-electric-blue to-violet text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,195,255,0.4)] transition-all transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>Generar Lección con IA</span>
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-dark-secondary rounded-2xl border border-gray-800 mb-8 overflow-hidden">
          <div className="border-b border-gray-800">
            <nav className="flex overflow-x-auto hide-scrollbar">
              {[
                { id: 'overview', label: 'Resumen', icon: '📋' },
                { id: 'content', label: 'Contenido', icon: '📚' },
                { id: 'cases', label: 'Casos Reales', icon: '🏆' },
                { id: 'analysis', label: 'Análisis', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-5 px-8 font-medium transition-all whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-electric-blue text-white bg-dark-tertiary'
                      : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-dark-tertiary/50'
                  }`}
                >
                  <span className="mr-2 opacity-80">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Objectives */}
                <div className="bg-dark-tertiary/50 border border-electric-blue/20 p-8 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-electric-blue"></div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="mr-3 text-2xl">🎯</span> Lo que lograrás
                  </h3>
                  <ul className="space-y-4">
                    {courseModule.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-electric-blue"></div>
                        </div>
                        <span className="text-gray-300 text-lg">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Advantages and Disadvantages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-dark-tertiary/30 border border-green-500/20 p-8 rounded-2xl">
                    <h3 className="text-lg font-bold text-green-400 mb-6 flex items-center">
                      <span className="mr-2">✅</span> Ventajas
                    </h3>
                    <ul className="space-y-4">
                      {courseModule.advantages.map((advantage, index) => (
                        <li key={index} className="flex items-start text-gray-400">
                          <span className="text-green-500 mr-3 font-bold">+</span>
                          <span>{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-dark-tertiary/30 border border-orange-500/20 p-8 rounded-2xl">
                    <h3 className="text-lg font-bold text-orange-400 mb-6 flex items-center">
                      <span className="mr-2">⚠️</span> Retos a superar
                    </h3>
                    <ul className="space-y-4">
                      {courseModule.disadvantages.map((disadvantage, index) => (
                        <li key={index} className="flex items-start text-gray-400">
                          <span className="text-orange-500 mr-3 font-bold">-</span>
                          <span>{disadvantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Contenido del Módulo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: '¿Qué es?', icon: '🤔', description: 'Fundamentos y definiciones base de la metodología.' },
                    { title: '¿Por qué importa?', icon: '💡', description: 'El impacto real que tendrá en las métricas de tu negocio.' },
                    { title: '¿Cómo aplicarlo?', icon: '🚀', description: 'Manual paso a paso para implementación inmediata.' },
                    { title: 'Casos', icon: '📊', description: 'Análisis de empresas que ya lo lograron.' },
                    { title: 'Herramientas', icon: '🛠️', description: 'Software y plantillas que facilitan el trabajo.' },
                    { title: 'Acción', icon: '⚡', description: 'Tareas concretas para ejecutar hoy mismo.' }
                  ].map((item, index) => (
                    <div key={index} className="bg-dark-tertiary border border-gray-800 p-6 rounded-2xl hover:border-violet/40 transition-colors group">
                      <div className="text-3xl mb-4 bg-dark-bg w-14 h-14 rounded-xl flex items-center justify-center border border-gray-800 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <h4 className="font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'cases' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Casos de Éxito Reales</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {courseModule.successCases.map((caseStudy, index) => (
                    <div key={index} className="bg-dark-tertiary border border-gray-800 p-8 rounded-2xl relative overflow-hidden group hover:border-violet/30 transition-colors">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet rounded-full mix-blend-screen filter blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                      
                      <div className="flex items-start justify-between mb-8 relative z-10">
                        <div>
                          <h4 className="text-2xl font-bold text-white mb-2">{caseStudy.company}</h4>
                          <span className="inline-block px-3 py-1 bg-violet/10 text-violet text-xs font-bold uppercase tracking-wide rounded-full border border-violet/20">
                            {caseStudy.industry}
                          </span>
                        </div>
                        <div className="text-3xl opacity-80">🏢</div>
                      </div>
                      
                      <div className="space-y-6 relative z-10">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">El Problema</span>
                          <p className="text-gray-300 text-lg">{caseStudy.challenge}</p>
                        </div>
                        
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 block">La Solución Implementada</span>
                          <p className="text-gray-300">{caseStudy.solution}</p>
                        </div>
                        
                        <div className="bg-green-500/10 p-5 rounded-xl border border-green-500/20">
                          <span className="text-xs font-bold uppercase tracking-wider text-green-500 mb-1 block">Resultados Clave</span>
                          <p className="text-green-400 font-bold text-xl">{caseStudy.results}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-8">
                {/* Key Takeaways */}
                <div className="bg-dark-tertiary border border-violet/20 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="text-violet mr-3 text-2xl">🔑</span> Conclusiones Clave
                  </h3>
                  <ul className="space-y-4">
                    {courseModule.finalAnalysis.keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-center bg-dark-bg p-4 rounded-xl border border-gray-800">
                        <div className="w-8 h-8 bg-violet/20 text-violet rounded-lg flex items-center justify-center font-bold mr-4 border border-violet/30 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-gray-300">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Next Steps */}
                  <div className="bg-dark-tertiary border border-electric-blue/20 p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <span className="text-electric-blue mr-3 text-2xl">🎯</span> Siguientes Pasos
                    </h3>
                    <div className="space-y-4">
                      {courseModule.finalAnalysis.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start text-gray-400">
                          <span className="text-electric-blue mr-3 mt-1">→</span>
                          <span className="text-gray-300 leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="bg-dark-tertiary border border-gray-800 p-8 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <span className="mr-3 text-2xl">📚</span> Recursos Extra
                    </h3>
                    <div className="space-y-4">
                      {courseModule.finalAnalysis.resources.map((resource, index) => (
                        <div key={index} className="flex items-center justify-between bg-dark-bg p-4 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer group">
                          <div className="flex items-center">
                            <span className="text-2xl mr-4">{getResourceIcon(resource.type)}</span>
                            <div>
                              <div className="font-bold text-gray-200 group-hover:text-white transition-colors">{resource.name}</div>
                              <div className="text-xs text-gray-500 uppercase tracking-wider">{resource.type}</div>
                            </div>
                          </div>
                          {resource.url && (
                            <div className="text-electric-blue opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
