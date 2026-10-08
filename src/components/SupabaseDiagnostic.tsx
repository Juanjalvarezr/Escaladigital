import React, { useState } from 'react';
import { geminiService, DiagnosticResult } from '../services/gemini';
import { useAuth } from './SupabaseAuthProvider';
import { supabase } from '../supabase';
import { BUSINESS_AREAS } from '../types';
import { getCompanyIdForUser, recordLearningEvent } from '../services/learningEvents';

// 🔥 SISTEMA MEJORADO DE GENERACIÓN DE CONTENIDO ULTRA PERSONALIZADO
const createLearningPath = async (
  userId: string, 
  recommendedModules: string[], 
  businessDescription: string,
  businessType: string
) => {
  try {
    console.log('🚀 Creando ruta de aprendizaje ultra personalizada...');
    console.log(`📊 Contexto: ${businessType} - ${businessDescription}`);
    
    // Para cada módulo recomendado, crear progreso inicial
    for (const moduleId of recommendedModules) {
      const area = BUSINESS_AREAS.find(a => a.id === moduleId);
      if (!area) continue;

      console.log(`📚 Generando módulo: ${area.name}`);

      // Crear progreso del módulo
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          status: 'not_started',
          completion_percentage: 0,
          lessons_completed: [],
          last_accessed: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });

      if (progressError) {
        console.error(`Error creating progress for ${moduleId}:`, progressError);
      }

      // Generar lecciones para este módulo con contexto ultra personalizado
      await generateModuleLessons(userId, moduleId, area.name, businessDescription, businessType);
    }

    console.log('✅ Ruta de aprendizaje ultra personalizada creada exitosamente');
  } catch (error) {
    console.error('Error creating learning path:', error);
  }
};

// 🔥 GENERACIÓN DE LECCIONES ULTRA PERSONALIZADAS
const generateModuleLessons = async (
  userId: string, 
  moduleId: string, 
  moduleName: string,
  businessDescription: string,
  businessType: string
) => {
  const lessonTopics = [
    'Fundamentos y diagnóstico inicial',
    'Estrategias core y planificación',
    'Herramientas digitales esenciales',
    'Implementación práctica y medición',
    'Optimización y escalado avanzado'
  ];

  try {
    for (let i = 0; i < lessonTopics.length; i++) {
      const topic = lessonTopics[i];
      const lessonId = `${moduleId}_lesson_${i + 1}`;

      console.log(`🔥 Generando lección ${i + 1}: ${topic}`);

      // Generar contenido con IA ultra personalizado
      const lessonContent = await geminiService.generateLessonContent(
        moduleName,
        topic,
        `Negocio tipo: ${businessType}. Descripción: ${businessDescription}. Sector: ${moduleName}`
      );

      // Guardar lección en Supabase
      const { error: lessonError } = await supabase
        .from('user_lessons')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          module_id: moduleId,
          title: lessonContent.title,
          content: lessonContent.content,
          summary: lessonContent.summary,
          key_points: lessonContent.keyPoints,
          order: i + 1,
          duration: 20 // 20 minutos por lección ultra personalizada
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (lessonError) {
        console.error(`Error creating lesson ${lessonId}:`, lessonError);
      }

      // Pequeña pausa para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Lecciones ultra personalizadas generadas para ${moduleId}`);
  } catch (error) {
    console.error(`Error generating lessons for ${moduleId}:`, error);
  }
};

interface SupabaseDiagnosticProps {
  onComplete: (result: DiagnosticResult) => void;
}

const SupabaseDiagnostic: React.FC<SupabaseDiagnosticProps> = ({ onComplete }) => {
  const { user, updateUserProfile } = useAuth();
  const [businessDescription, setBusinessDescription] = useState('');
  const [mainChallenge, setMainChallenge] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessDescription.trim() || !mainChallenge.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    if (selectedAreas.length === 0) {
      setError('Selecciona al menos un área que ya identifiques en tu empresa');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🤖 Iniciando análisis IA ultra personalizado...');
      
      const result = await geminiService.analyzeBusiness({
        description: `${businessDescription}\nÁreas que el emprendedor ya identifica: ${selectedAreas.join(', ')}`,
        goals: mainChallenge,
        actividad: businessDescription
      });
      const enrichedResult: DiagnosticResult = {
        ...result,
        recommendedModules: Array.from(new Set([...result.recommendedModules, ...selectedAreas])),
        organizationalAreas: Object.fromEntries(
          BUSINESS_AREAS.map(area => [area.id, selectedAreas.includes(area.id) ? 'defined' : 'not_defined'])
        ) as Record<string, 'defined' | 'not_defined'>
      };
      
      // Save diagnostic result to Supabase
      if (user) {
        const { error: diagnosticError } = await supabase
          .from('user_diagnostics')
          .insert({
            user_id: user.id,
            business_type: enrichedResult.businessType,
            main_challenge: enrichedResult.mainChallenge,
            business_description: businessDescription,
            scalability_roadmap: enrichedResult.scalabilityRoadmap,
            recommended_modules: enrichedResult.recommendedModules
          });

        if (diagnosticError) {
          console.error('Error saving diagnostic:', diagnosticError);
        }

        void recordLearningEvent({
          companyId: getCompanyIdForUser(user),
          userId: user.id,
          eventType: 'diagnostic_completed',
          eventProperties: {
            businessType: enrichedResult.businessType,
            mainChallenge: enrichedResult.mainChallenge,
            recommendedModules: enrichedResult.recommendedModules,
            organizationalAreas: enrichedResult.organizationalAreas,
            selectedAreaCount: selectedAreas.length,
            totalAreaCount: BUSINESS_AREAS.length
          }
        });

        // Update user profile con información enriquecida
        await updateUserProfile({
          company: businessDescription.split(' ').slice(0, 3).join(' '),
          industry: enrichedResult.businessType,
          business_description: businessDescription,
          main_challenge: mainChallenge
        });

        // 🔥 CREAR RUTA DE APRENDIZAJE ULTRA PERSONALIZADA
        await createLearningPath(user.id, enrichedResult.recommendedModules, businessDescription, enrichedResult.businessType);
      }

      console.log('✅ Análisis completado. Generando contenido personalizado...');
      onComplete(enrichedResult);
    } catch (error) {
      console.error('Error in diagnostic:', error);
      setError('Error al procesar el diagnóstico. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Header con animación mejorada */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full mb-6 animate-pulse shadow-2xl">
              <span className="text-4xl">🚀</span>
            </div>
            <h1 className="text-6xl font-black text-white mb-4 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              ESCALA DIGITAL
            </h1>
            <p className="text-2xl text-gray-300 mb-2 leading-relaxed">
              IA Ultra Personalizada para tu Negocio
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Sistema de generación de contenido activo</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Campo de descripción del negocio mejorado */}
            <div className="group">
              <label className="block text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-lg">🏢</span>
                Describe tu negocio en detalle
              </label>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className="w-full px-8 py-6 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-violet-500/50 focus:border-violet-400 resize-none transition-all duration-300 text-xl leading-relaxed"
                rows={5}
                placeholder="Ej: Tengo una droguería familiar en el centro de la ciudad con 5 empleados, llevamos 10 años, vendemos medicamentos, productos de cuidado personal, artículos de aseo, y tenemos problemas con inventario y pocas ventas nuevas. Queremos digitalizar las ventas y mejorar la gestión..."
                required
              />
              <div className="mt-3 text-sm text-gray-400 flex justify-between">
                <span>{businessDescription.length}/1000 caracteres</span>
                <span className="text-green-400">✍ Más detalles = mejor personalización</span>
              </div>
            </div>

            {/* Campo del desafío principal mejorado */}
            <div className="group">
              <label className="block text-xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-lg">🎯</span>
                ¿Cuál es tu mayor obstáculo actualmente?
              </label>
              <textarea
                value={mainChallenge}
                onChange={(e) => setMainChallenge(e.target.value)}
                className="w-full px-8 py-6 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-violet-500/50 focus:border-violet-400 resize-none transition-all duration-300 text-xl leading-relaxed"
                rows={4}
                placeholder="Ej: No logramos atraer clientes nuevos desde hace 6 meses, las ventas solo dependen de los clientes antiguos, no tenemos presencia online, el inventario se desactualiza constantemente, y no sabemos cómo competir con las grandes cadenas de farmacias..."
                required
              />
              <div className="mt-3 text-sm text-gray-400 flex justify-between">
                <span>{mainChallenge.length}/500 caracteres</span>
                <span className="text-orange-400">🎯 Sé específico para mejor ayuda</span>
              </div>
            </div>

            <div className="group">
              <label className="block text-xl font-bold text-white mb-3 flex items-center gap-3">
                <span className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-lg">🧭</span>
                ¿Qué áreas ya identificas en tu empresa?
              </label>
              <p className="text-gray-300 mb-5">
                Selecciona las áreas que actualmente existen o que reconoces, aunque todavía sean pequeñas o las gestione una sola persona.
                Esto nos ayuda a mostrarte qué tan completa está hoy tu organización.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {BUSINESS_AREAS.map(area => {
                  const selected = selectedAreas.includes(area.id);
                  return (
                    <button
                      type="button"
                      key={area.id}
                      aria-pressed={selected}
                      onClick={() => setSelectedAreas(current => selected
                        ? current.filter(id => id !== area.id)
                        : [...current, area.id])}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? 'bg-emerald-500/20 border-emerald-400 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-emerald-400/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <span>{area.icon}</span>
                        <span>{area.name}</span>
                      </div>
                      <span className="block mt-2 text-xs opacity-75">
                        {selected ? 'Área identificada' : 'Aún no seleccionada'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 rounded-xl bg-white/5 border border-white/10 p-4" role="status">
                <p className="font-semibold text-white">
                  {selectedAreas.length === BUSINESS_AREAS.length
                    ? 'Excelente: identificas las 8 áreas clave. Eso demuestra una visión organizacional completa.'
                    : selectedAreas.length >= 4
                      ? `Identificas ${selectedAreas.length} de ${BUSINESS_AREAS.length} áreas. Tienes una base; revisaremos las restantes para ayudarte a escalar.`
                      : `Identificas ${selectedAreas.length} de ${BUSINESS_AREAS.length} áreas. Las demás serán oportunidades para organizar, delegar y crecer.`}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Las áreas no seleccionadas no son un error: se convierten en recomendaciones de desarrollo.
                </p>
              </div>
            </div>

            {/* Mensaje de error mejorado */}
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-6 text-red-200 flex items-center gap-4 animate-pulse">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-bold text-lg">{error}</div>
                  <div className="text-sm mt-1">Revisa los campos e intenta nuevamente</div>
                </div>
              </div>
            )}

            {/* Botón de envío ultra mejorado */}
            <button
              type="submit"
              disabled={loading || !businessDescription.trim() || !mainChallenge.trim() || selectedAreas.length === 0}
              className="w-full py-6 px-12 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-xl rounded-2xl hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-3xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center gap-4">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/30 border-t-white"></div>
                    <span className="text-lg">Analizando con IA Ultra Personalizada...</span>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🤖</span>
                    <span>Generar Mi Plan Ultra Personalizado</span>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </>
                )}
              </span>
            </button>

            {/* Indicadores de confianza mejorados */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-400 text-2xl">✓</span>
                </div>
                <div className="text-sm text-gray-300 font-semibold">IA Ultra Avanzada</div>
                <div className="text-xs text-gray-400 mt-1">Contenido 100% personalizado</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-400 text-2xl">⚡</span>
                </div>
                <div className="text-sm text-gray-300 font-semibold">Generación Instantánea</div>
                <div className="text-xs text-gray-400 mt-1">5 lecciones por módulo</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-400 text-2xl">🎯</span>
                </div>
                <div className="text-sm text-gray-300 font-semibold">100% Adaptado a Ti</div>
                <div className="text-xs text-gray-400 mt-1">Ejemplos reales del sector</div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupabaseDiagnostic;