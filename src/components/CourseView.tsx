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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄';
      case 'video': return '🎥';
      case 'tool': return '🛠️';
      case 'template': return '📋';
      default: return '📎';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(courseModule.difficulty)}`}>
                {courseModule.difficulty === 'beginner' ? 'Principiante' :
                 courseModule.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </span>
              <span className="text-gray-500">⏱️ {courseModule.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">{courseModule.title}</h1>
          <p className="text-xl text-blue-100 leading-relaxed">{courseModule.description}</p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: '📋 Resumen', icon: '📋' },
                { id: 'content', label: '📚 Contenido', icon: '📚' },
                { id: 'cases', label: '🏆 Casos de Éxito', icon: '🏆' },
                { id: 'analysis', label: '📊 Análisis Final', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-6 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Objectives */}
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
                  <h3 className="text-xl font-bold text-green-800 mb-4">🎯 Objetivos del Módulo</h3>
                  <ul className="space-y-3">
                    {courseModule.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Advantages and Disadvantages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
                    <h3 className="text-xl font-bold text-blue-800 mb-4">✅ Ventajas</h3>
                    <ul className="space-y-2">
                      {courseModule.advantages.map((advantage, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-600">+</span>
                          <span className="text-blue-700">{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded">
                    <h3 className="text-xl font-bold text-orange-800 mb-4">⚠️ Desventajas</h3>
                    <ul className="space-y-2">
                      {courseModule.disadvantages.map((disadvantage, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-orange-600">-</span>
                          <span className="text-orange-700">{disadvantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
                  <h3 className="text-xl font-bold text-purple-800 mb-4">📖 Contenido del Curso</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: '¿Qué es?', icon: '🤔', description: 'Conceptos fundamentales y definiciones clave' },
                      { title: '¿Por qué importa?', icon: '💡', description: 'Impacto directo en tu negocio' },
                      { title: '¿Cómo aplicarlo?', icon: '🚀', description: 'Pasos prácticos y accionables' },
                      { title: 'Ejemplos', icon: '📊', description: 'Casos reales y aplicados' },
                      { title: 'Herramientas', icon: '🛠️', description: 'Recursos y software recomendado' },
                      { title: 'Ejercicios', icon: '✏️', description: 'Prácticas para afianzar conocimientos' }
                    ].map((item, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <h4 className="font-semibold text-gray-800 mb-2">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cases' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">🏆 Casos de Éxito Reales</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {courseModule.successCases.map((caseStudy, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-800">{caseStudy.company}</h4>
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mt-1">
                            {caseStudy.industry}
                          </span>
                        </div>
                        <div className="text-2xl">🏢</div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <span className="font-semibold text-red-600">Desafío:</span>
                          <p className="text-gray-700 mt-1">{caseStudy.challenge}</p>
                        </div>
                        
                        <div>
                          <span className="font-semibold text-blue-600">Solución:</span>
                          <p className="text-gray-700 mt-1">{caseStudy.solution}</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <span className="font-semibold text-green-700">Resultados:</span>
                          <p className="text-green-800 font-bold mt-1">{caseStudy.results}</p>
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
                <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded">
                  <h3 className="text-xl font-bold text-indigo-800 mb-4">🔑 Conclusiones Clave</h3>
                  <ul className="space-y-3">
                    {courseModule.finalAnalysis.keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-indigo-700">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Steps */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                  <h3 className="text-xl font-bold text-yellow-800 mb-4">🎯 Próximos Pasos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courseModule.finalAnalysis.nextSteps.map((step, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">📋</span>
                          <span className="font-semibold text-gray-800">Paso {index + 1}</span>
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div className="bg-gray-50 border-l-4 border-gray-500 p-6 rounded">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Recursos Adicionales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courseModule.finalAnalysis.resources.map((resource, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{getResourceIcon(resource.type)}</span>
                          <span className="font-semibold text-gray-800">{resource.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Acceder →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <button 
            onClick={handleStartModule}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            🚀 Comenzar Módulo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
