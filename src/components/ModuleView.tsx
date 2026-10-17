import React from 'react';
import { useState } from 'react';
import { useAuth } from './SupabaseAuthProvider';
import { supabase } from '../supabase';
import type { SalesModuleContent } from '../data/modules/sales.module';

interface ModuleViewProps {
  module: SalesModuleContent;
  onBack: () => void;
}

const ModuleView: React.FC<ModuleViewProps> = ({ module, onBack }) => {
  const { user } = useAuth();
  const [currentLesson, setCurrentLesson] = useState(1);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'lessons' | 'resources' | 'tools' | 'templates'>('lessons');

  const currentLessonData = module.lessons.find(l => l.number === currentLesson);

  const handleLessonComplete = async (lessonId: string) => {
    if (!user) return;
    
    const newCompleted = [...completedLessons, lessonId];
    setCompletedLessons(newCompleted);
    
    try {
      await supabase.from('user_progress').upsert({
        user_id: user.id,
        module_id: module.moduleId,
        completion_percentage: Math.round((newCompleted.length / module.lessons.length) * 100),
        lessons_completed: newCompleted,
        last_accessed: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' });
    } catch (error) {
      console.warn('Error saving progress:', error);
    }
  };

  const handleNextLesson = () => {
    if (currentLesson < module.lessons.length) {
      handleLessonComplete(`lesson-${currentLesson}`);
      setCurrentLesson(currentLesson + 1);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLesson > 1) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const completionPercentage = Math.round((completedLessons.length / module.lessons.length) * 100);

  if (!currentLessonData) {
    return <div className="text-white p-8">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <header className="bg-dark-secondary border-b border-gray-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="mb-4 text-gray-400 hover:text-electric-blue flex items-center gap-2 transition"
          >
            ← Volver
          </button>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-violet">
                {module.title}
              </h1>
              <p className="text-gray-400 mt-2">{module.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progreso</span>
              <span className="text-electric-blue font-semibold">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-electric-blue to-violet transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-right">
              {completedLessons.length} de {module.lessons.length} lecciones completadas
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 border-b border-gray-800 pb-4 overflow-x-auto">
          {(['lessons', 'resources', 'tools', 'templates'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? 'text-electric-blue border-b-2 border-electric-blue'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'lessons' && '📚 Lecciones'}
              {tab === 'resources' && '📦 Recursos'}
              {tab === 'tools' && '🛠️ Herramientas'}
              {tab === 'templates' && '📄 Plantillas'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'lessons' && (
              <div className="bg-dark-secondary border border-electric-blue/30 rounded-xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-electric-blue font-semibold mb-1">
                      Lección {currentLessonData.number} de {module.lessons.length}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{currentLessonData.title}</h2>
                    <p className="text-gray-400 mt-2">{currentLessonData.duration} minutos</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-dark-tertiary rounded-lg border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">Puntos Clave</h3>
                  <ul className="space-y-2">
                    {currentLessonData.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-gray-300 flex gap-3">
                        <span className="text-electric-blue font-bold">✓</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6 bg-dark-tertiary rounded-lg p-6 border border-gray-700">
                  <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed max-h-96 overflow-y-auto">
                    {currentLessonData.content}
                  </div>
                </div>

                {currentLessonData.caseStudy && (
                  <div className="mb-6 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                    <h3 className="text-lg font-semibold text-green-300 mb-4">📊 Caso de Éxito Real</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-gray-400">Empresa</div>
                        <div className="text-white font-medium">{currentLessonData.caseStudy.company}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Problema</div>
                        <div className="text-gray-200">{currentLessonData.caseStudy.problem}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Solución</div>
                        <div className="text-gray-200">{currentLessonData.caseStudy.solution}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Resultado</div>
                        <div className="text-green-300 font-semibold">{currentLessonData.caseStudy.result}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6 p-6 bg-dark-tertiary rounded-lg border border-violet/30">
                  <h3 className="text-lg font-semibold text-violet mb-3">✏️ Acciones Inmediatas</h3>
                  <div className="space-y-2">
                    {currentLessonData.actionItems.map((item, idx) => (
                      <div key={idx} className="flex gap-3 text-gray-300">
                        <input type="checkbox" className="cursor-pointer mt-1" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-700">
                  <button
                    onClick={handlePreviousLesson}
                    disabled={currentLesson === 1}
                    className={`flex-1 py-3 rounded-lg font-medium transition ${
                      currentLesson === 1
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-dark-tertiary text-white hover:bg-gray-700'
                    }`}
                  >
                    ← Anterior
                  </button>

                  <button
                    onClick={() => handleLessonComplete(`lesson-${currentLessonData.number}`)}
                    className="flex-1 py-3 rounded-lg font-medium bg-violet hover:bg-violet/90 text-white transition"
                  >
                    ✓ Completar
                  </button>

                  <button
                    onClick={handleNextLesson}
                    disabled={currentLesson === module.lessons.length}
                    className={`flex-1 py-3 rounded-lg font-medium transition ${
                      currentLesson === module.lessons.length
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-electric-blue text-white hover:bg-electric-blue/90'
                    }`}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-4">
                {currentLessonData.resources?.map(resource => (
                  <div key={resource.id} className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                        <p className="text-gray-400">{resource.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="grid gap-4">
                {module.tools.map(tool => (
                  <div key={tool.id} className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">🔧 {tool.title}</h3>
                    <p className="text-gray-400">{tool.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="grid gap-4">
                {module.templates.map(template => (
                  <div key={template.id} className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">📄 {template.title}</h3>
                    <p className="text-gray-400">{template.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-dark-secondary border border-electric-blue/30 rounded-xl p-6 mb-6 sticky top-32">
              <h3 className="text-lg font-semibold text-white mb-3">🎯 Objetivo</h3>
              <p className="text-gray-300">{module.objective}</p>
            </div>

            <div className="bg-dark-secondary border border-violet/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📈 Métricas de Éxito</h3>
              <ul className="space-y-3">
                {module.successMetrics.map((metric, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-violet font-bold">✓</span>
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModuleView;
