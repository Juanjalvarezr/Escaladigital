import React, { useState, useEffect } from 'react';
import { LessonContent } from '../services/gemini';
import { useAuth } from './SupabaseAuthProvider';

interface EnhancedLessonViewProps {
  lessonContent: LessonContent;
  onComplete: () => void;
}

const EnhancedLessonView: React.FC<EnhancedLessonViewProps> = ({ lessonContent, onComplete }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'tools' | 'checklist' | 'mistakes'>('content');
  const { user } = useAuth();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{lessonContent.title}</h1>
        <p className="text-blue-100 text-lg">{lessonContent.summary}</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 mb-6 border-b">
        {[
          { id: 'content', label: '📚 Contenido', icon: '📖' },
          { id: 'tools', label: '🛠️ Herramientas', icon: '⚡' },
          { id: 'checklist', label: '✅ Checklist', icon: '📝' },
          { id: 'mistakes', label: '⚠️ Errores Comunes', icon: '🚫' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {activeTab === 'content' && (
          <div className="space-y-8">
            {/* What Is */}
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
              <h3 className="text-xl font-bold text-green-800 mb-3">🤔 ¿Qué es?</h3>
              <p className="text-green-700 leading-relaxed">{lessonContent.whatIs}</p>
            </div>

            {/* Why It Matters */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
              <h3 className="text-xl font-bold text-blue-800 mb-3">💡 ¿Por qué importa?</h3>
              <p className="text-blue-700 leading-relaxed">{lessonContent.whyItMatters}</p>
            </div>

            {/* How to Apply */}
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
              <h3 className="text-xl font-bold text-purple-800 mb-3">🚀 Cómo aplicarlo</h3>
              <div className="space-y-3">
                {lessonContent.howToApply.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-purple-700 flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real World Example */}
            {lessonContent.realWorldExample && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
                <h3 className="text-xl font-bold text-yellow-800 mb-3">🏆 Ejemplo Real</h3>
                <div className="bg-white p-4 rounded-lg border border-yellow-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="font-semibold text-gray-700">Empresa:</span>
                      <p className="text-gray-600">{lessonContent.realWorldExample.company}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Resultado:</span>
                      <p className="text-green-600 font-bold">{lessonContent.realWorldExample.result}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-gray-700">Situación:</span>
                      <p className="text-gray-600">{lessonContent.realWorldExample.situation}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Solución:</span>
                      <p className="text-gray-600">{lessonContent.realWorldExample.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KPIs */}
            {lessonContent.kpis && lessonContent.kpis.length > 0 && (
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded">
                <h3 className="text-xl font-bold text-indigo-800 mb-3">📊 Métricas Clave</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessonContent.kpis.map((kpi, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-indigo-200">
                      <div className="font-semibold text-indigo-700 mb-1">{kpi.metric}</div>
                      <div className="text-2xl font-bold text-indigo-600 mb-1">{kpi.target}</div>
                      <div className="text-sm text-gray-600">{kpi.howToMeasure}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && lessonContent.tools && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🛠️ Herramientas Recomendadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessonContent.tools.map((tool, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{tool.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        tool.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        tool.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tool.difficulty}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        tool.price === 'free' ? 'bg-blue-100 text-blue-700' :
                        tool.price === 'freemium' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {tool.price === 'free' ? 'Gratis' : tool.price === 'freemium' ? 'Freemium' : 'Pago'}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                  <p className="text-gray-700 text-sm font-medium mb-3">✨ {tool.why}</p>
                  {tool.link && (
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Visitar herramienta
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2zm0 14l4-4m0 0l-4 4" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'checklist' && lessonContent.checklist && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">✅ Checklist de Implementación</h3>
            <div className="space-y-3">
              {lessonContent.checklist.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    defaultChecked={false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Aquí podríamos guardar progreso
                      }
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        item.priority === 'important' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.priority === 'critical' ? 'Crítico' :
                         item.priority === 'important' ? 'Importante' : 'Opcional'}
                      </span>
                      <span className="text-sm text-gray-500">⏱️ {item.timeframe}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{item.item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'mistakes' && lessonContent.commonMistakes && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-red-800 mb-4">⚠️ Errores Comunes a Evitar</h3>
            <div className="space-y-4">
              {lessonContent.commonMistakes.map((mistake, index) => (
                <div key={index} className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start space-x-2 mb-2">
                    <span className="text-2xl">❌</span>
                    <h4 className="font-semibold text-red-800">{mistake.mistake}</h4>
                  </div>
                  <div className="bg-white p-3 rounded border border-red-200 mb-2">
                    <p className="text-red-700 text-sm">
                      <span className="font-semibold">Consecuencia:</span> {mistake.consequence}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-green-700 text-sm">
                      <span className="font-semibold">✅ Cómo evitarlo:</span> {mistake.howToAvoid}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      {lessonContent.nextSteps && lessonContent.nextSteps.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Próximos Pasos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lessonContent.nextSteps.map((step, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border text-center">
                <div className="text-2xl mb-2">{index === 0 ? '🎯' : index === 1 ? '📈' : '🚀'}</div>
                <p className="text-gray-700 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry Insights */}
      {user?.user_metadata?.industry && lessonContent.industryInsights?.[user.user_metadata.industry] && (
        <div className="mt-6 bg-orange-50 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-orange-800 mb-4">🏭 Insights para tu Industria</h3>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-orange-700 font-medium mb-3">
              {lessonContent.industryInsights[user.user_metadata.industry].specificAdvice}
            </p>
            <div className="space-y-2">
              {lessonContent.industryInsights[user.user_metadata.industry].localExamples.map((example, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-orange-600">📍</span>
                  <span className="text-gray-700">{example}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
        >
          🎉 Marcar Lección como Completada
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
};

export default EnhancedLessonView;
