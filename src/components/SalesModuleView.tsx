import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/SupabaseAuthProvider';
import { supabase } from '../supabase';
import SALES_MODULE from '../data/modules/sales.module';

interface LessonProgressState {
  currentLesson: number;
  completedLessons: string[];
  resourcesViewed: string[];
}

const SalesModuleView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LessonProgressState>({
    currentLesson: 1,
    completedLessons: [],
    resourcesViewed: []
  });
  const [activeTab, setActiveTab] = useState<'lessons' | 'resources' | 'tools' | 'templates'>('lessons');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(`lesson-1`);
  const [showResourceDetail, setShowResourceDetail] = useState<string | null>(null);

  const currentLessonData = SALES_MODULE.lessons.find(l => l.number === progress.currentLesson);

  const handleLessonComplete = async (lessonId: string) => {
    if (!user) return;

    const newCompleted = [...progress.completedLessons, lessonId];
    setProgress({ ...progress, completedLessons: newCompleted });

    // Registrar progreso en Supabase
    try {
      await supabase.from('user_progress').upsert({
        user_id: user.id,
        module_id: SALES_MODULE.moduleId,
        completion_percentage: Math.round((newCompleted.length / SALES_MODULE.lessons.length) * 100),
        lessons_completed: newCompleted,
        last_accessed: new Date().toISOString()
      }, {
        onConflict: 'user_id,module_id'
      });
    } catch (error) {
      console.warn('No se pudo guardar progreso en Supabase', error);
    }
  };

  const handleNextLesson = () => {
    if (progress.currentLesson < SALES_MODULE.lessons.length) {
      handleLessonComplete(`lesson-${progress.currentLesson}`);
      setProgress({ ...progress, currentLesson: progress.currentLesson + 1 });
      setExpandedLesson(`lesson-${progress.currentLesson + 1}`);
    }
  };

  const handlePreviousLesson = () => {
    if (progress.currentLesson > 1) {
      setProgress({ ...progress, currentLesson: progress.currentLesson - 1 });
      setExpandedLesson(`lesson-${progress.currentLesson - 1}`);
    }
  };

  const handleResourceView = (resourceId: string) => {
    if (!progress.resourcesViewed.includes(resourceId)) {
      setProgress({
        ...progress,
        resourcesViewed: [...progress.resourcesViewed, resourceId]
      });
    }
  };

  const completionPercentage = Math.round(
    (progress.completedLessons.length / SALES_MODULE.lessons.length) * 100
  );

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
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
                💰 {SALES_MODULE.title}
              </h1>
              <p className="text-gray-400 mt-2">{SALES_MODULE.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progreso del módulo</span>
              <span className="text-electric-blue font-semibold">{completionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-electric-blue to-violet transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-right">
              {progress.completedLessons.length} de {SALES_MODULE.lessons.length} lecciones completadas
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
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
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'lessons' && (
              <div className="space-y-6">
                {/* Current Lesson */}
                {currentLessonData && (
                  <div className="bg-dark-secondary border border-electric-blue/30 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-electric-blue font-semibold mb-1">
                          Lección {currentLessonData.number} de {SALES_MODULE.lessons.length}
                        </div>
                        <h2 className="text-2xl font-bold text-white">{currentLessonData.title}</h2>
                        <p className="text-gray-400 mt-2">
                          Duración aproximada: {currentLessonData.duration} minutos
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-violet">
                          {Math.round((progress.currentLesson / SALES_MODULE.lessons.length) * 100)}%
                        </div>
                        <p className="text-sm text-gray-400">completado</p>
                      </div>
                    </div>

                    {/* Key Points */}
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

                    {/* Content */}
                    <div className="prose prose-invert mb-6">
                      <div className="bg-dark-tertiary rounded-lg p-6 border border-gray-700">
                        <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                          {currentLessonData.content}
                        </div>
                      </div>
                    </div>

                    {/* Case Study */}
                    {currentLessonData.caseStudy && (
                      <div className="mb-6 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                        <h3 className="text-lg font-semibold text-green-300 mb-4">📊 Caso de Éxito Real</h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <div className="text-gray-400">Empresa</div>
                            <div className="text-white font-medium">{currentLessonData.caseStudy.company}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">El Problema</div>
                            <div className="text-gray-200">{currentLessonData.caseStudy.problem}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">La Solución</div>
                            <div className="text-gray-200">{currentLessonData.caseStudy.solution}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">El Resultado</div>
                            <div className="text-green-300 font-semibold">{currentLessonData.caseStudy.result}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Items */}
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

                    {/* Lesson Navigation */}
                    <div className="flex gap-4 pt-6 border-t border-gray-700">
                      <button
                        onClick={handlePreviousLesson}
                        disabled={progress.currentLesson === 1}
                        className={`flex-1 py-3 rounded-lg font-medium transition ${
                          progress.currentLesson === 1
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
                        ✓ Marcar como completada
                      </button>

                      <button
                        onClick={handleNextLesson}
                        disabled={progress.currentLesson === SALES_MODULE.lessons.length}
                        className={`flex-1 py-3 rounded-lg font-medium transition ${
                          progress.currentLesson === SALES_MODULE.lessons.length
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-electric-blue text-white hover:bg-electric-blue/90'
                        }`}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-4">
                {currentLessonData?.resources && currentLessonData.resources.map(resource => (
                  <div
                    key={resource.id}
                    className="bg-dark-secondary border border-gray-700 rounded-lg p-6 hover:border-electric-blue/50 transition cursor-pointer"
                    onClick={() => {
                      handleResourceView(resource.id);
                      setShowResourceDetail(resource.id);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {resource.type === 'template' && '📄'}
                            {resource.type === 'guide' && '📖'}
                            {resource.type === 'worksheet' && '📋'}
                            {resource.type === 'video' && '🎥'}
                            {resource.type === 'checklist' && '✅'}
                            {resource.type === 'tool' && '🔧'}
                          </span>
                          <h3 className="text-lg font-semibold text-white">{resource.title}</h3>
                        </div>
                        <p className="text-gray-400">{resource.description}</p>
                      </div>
                      <div className="text-2xl">
                        {progress.resourcesViewed.includes(resource.id) ? '✅' : '👁️'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="grid gap-4">
                {SALES_MODULE.tools.map(tool => (
                  <div key={tool.id} className="bg-dark-secondary border border-gray-700 rounded-lg p-6 hover:border-electric-blue/50 transition">
                    <h3 className="text-lg font-semibold text-white mb-2">🔧 {tool.title}</h3>
                    <p className="text-gray-400 mb-4">{tool.description}</p>
                    <button className="px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition text-sm font-medium">
                      Usar Herramienta →
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="grid gap-4">
                {SALES_MODULE.templates.map(template => (
                  <div key={template.id} className="bg-dark-secondary border border-gray-700 rounded-lg p-6 hover:border-violet/50 transition">
                    <h3 className="text-lg font-semibold text-white mb-2">📄 {template.title}</h3>
                    <p className="text-gray-400 mb-4">{template.description}</p>
                    <button className="px-4 py-2 bg-violet/20 text-violet rounded-lg hover:bg-violet/30 transition text-sm font-medium">
                      Descargar Template →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Objective */}
            <div className="bg-dark-secondary border border-electric-blue/20 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">🎯 Objetivo del Módulo</h3>
              <p className="text-gray-300 text-sm">{SALES_MODULE.objective}</p>
            </div>

            {/* Success Metrics */}
            <div className="bg-dark-secondary border border-green-500/20 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-300 mb-3">✅ Métrica de Éxito</h3>
              <ul className="space-y-2">
                {SALES_MODULE.successMetrics.slice(0, 4).map((metric, idx) => (
                  <li key={idx} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-green-400">→</span>
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lessons List */}
            <div className="bg-dark-secondary border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📚 Todas las Lecciones</h3>
              <div className="space-y-2">
                {SALES_MODULE.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setProgress({ ...progress, currentLesson: lesson.number });
                      setExpandedLesson(lesson.id);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition text-sm font-medium ${
                      progress.currentLesson === lesson.number
                        ? 'bg-electric-blue text-white'
                        : progress.completedLessons.includes(lesson.id)
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                        : 'bg-dark-tertiary text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {progress.completedLessons.includes(lesson.id) ? '✅' : `${lesson.number}.`} {lesson.title.substring(0, 20)}...
                      </span>
                      <span className="text-xs opacity-70">{lesson.duration}m</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesModuleView;
