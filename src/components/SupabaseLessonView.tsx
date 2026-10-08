import React, { useState, useEffect } from 'react';
import { geminiService, LessonContent } from '../services/gemini';
import { useAuth } from './SupabaseAuthProvider';
import EnhancedLessonView from './EnhancedLessonView';
import { supabase } from '../supabase';
import { Lesson } from '../types';
import { getLessonById } from '../data/lessons';
import { getCompanyIdForUser, recordLearningEvent } from '../services/learningEvents';

type StructuredLessonPayload = {
  whatIs?: string;
  whyItMatters?: string;
  howToApply?: string[];
  simpleExample?: string;
  tips?: string[];
  commonMistakes?: string[];
  tools?: Array<{ name: string; why: string; link?: string }>;
  checklist?: string[];
};

interface SupabaseLessonViewProps {
  moduleId: string;
  lessonId: string;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const SupabaseLessonView: React.FC<SupabaseLessonViewProps> = ({
  moduleId,
  lessonId,
  onComplete,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}) => {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseStructuredPayload = (raw: string): StructuredLessonPayload | null => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StructuredLessonPayload;
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        (!parsed.whatIs && !parsed.whyItMatters && !parsed.howToApply && !parsed.simpleExample && !parsed.tips && !parsed.checklist)
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
    }
  }, [user]);

  // Check completion status
  const checkCompletionStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('lessons_completed')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking completion:', error);
        return;
      }

      if (data?.lessons_completed) {
        setCompleted(data.lessons_completed.includes(lessonId));
      }
    } catch (error) {
      console.error('Error checking completion:', error);
    }
  };

  // Load lesson content
  const loadLesson = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_lessons')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading lesson:', error);
        return;
      }

      if (data) {
        setLesson({
          id: data.lesson_id,
          moduleId: data.module_id,
          title: data.title,
          content: data.content,
          summary: data.summary,
          keyPoints: data.key_points || [],
          order: data.order,
          duration: data.duration
        });
      } else {
        // Generate lesson content using Gemini
        const moduleNames: { [key: string]: string } = {
          'management': 'Gerencia',
          'sales': 'Ventas',
          'marketing': 'Marketing',
          'operations': 'Operaciones',
          'finance': 'Finanzas',
          'technology': 'Tecnología',
          'talent': 'Talento',
          'customer': 'Cliente'
        };
        const businessContext = user?.user_metadata?.company || 'Negocio local';
        const lessonContent = await geminiService.generateLessonContent(
          lessonId,
          'Lección interactiva',
          businessContext
        );

        const newLesson: Lesson = {
          id: lessonId,
          moduleId: moduleId,
          title: lessonContent.title,
          content: JSON.stringify(lessonContent),
          summary: lessonContent.summary || '',
          keyPoints: lessonContent.keyPoints || [],
          order: 1,
          duration: 30,
          created_at: new Date().toISOString()
        };

        // Guardar en Supabase
        const { error: insertError } = await supabase
          .from('lessons')
          .insert(newLesson);

        if (insertError) {
          console.error('Error saving lesson:', insertError);
        } else {
          setLesson(newLesson);
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      setError('Error al cargar la lección');
    } finally {
      setLoading(false);
    }
  };

  // Save lesson for later
  const handleSaveForLater = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_lessons')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          saved_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving lesson:', error);
      } else {
        setSaved(true);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  // Load lesson and check completion on mount
  useEffect(() => {
    loadLesson();
    checkCompletionStatus();
  }, [lessonId, user]);

  // Mark lesson as complete
  const handleMarkComplete = async () => {
    if (!user || !lesson) return;

    try {
      // Get current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching progress:', fetchError);
        return;
      }

      const updatedLessons = Array.from(new Set([...(currentProgress?.lessons_completed || []), lessonId]));
      const completionPercentage = Math.round((updatedLessons.length / 5) * 100);
      let progressPersisted = false;

      if (currentProgress) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            lessons_completed: updatedLessons,
            completion_percentage: completionPercentage,
            status: completionPercentage === 100 ? 'completed' : 'in_progress',
            last_accessed: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', currentProgress.id);

        if (updateError) {
          console.error('Error updating progress:', updateError);
        } else {
          setCompleted(true);
          progressPersisted = true;
        }
      } else {
        // Create new progress record
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            module_id: moduleId,
            status: completionPercentage === 100 ? 'completed' : 'in_progress',
            completion_percentage: completionPercentage,
            lessons_completed: updatedLessons,
            last_accessed: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating progress:', insertError);
        } else {
          setCompleted(true);
          progressPersisted = true;
        }
      }

      if (progressPersisted) {
        void recordLearningEvent({
          companyId: getCompanyIdForUser(user),
          userId: user.id,
          eventType: 'lesson_completed',
          moduleKey: moduleId,
          lessonKey: lessonId,
          eventProperties: { completionPercentage }
        });
      }

      onComplete();
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  // If we have structured content from Gemini, use EnhancedLessonView
  if (lesson && typeof lesson.content === 'string' && lesson.content.startsWith('{')) {
    try {
      const structuredContent = JSON.parse(lesson.content) as LessonContent;
      return (
        <EnhancedLessonView 
          lessonContent={structuredContent} 
          onComplete={handleMarkComplete}
        />
      );
    } catch (error) {
      console.error('Error parsing structured content:', error);
      // Fall back to regular view
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">Necesitas una sesión para ver esta lección.</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">No se pudo cargar la lección</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-dark-secondary rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{lesson.duration} min</span>
              {completed && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  Completado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {(() => {
            const structured = parseStructuredPayload(lesson.content);
            if (!structured) {
              return (
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {lesson.content}
                  </div>
                </div>
              );
            }

            const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
              <div className="bg-dark-tertiary rounded-xl border border-gray-600 p-4">
                <div className="text-white font-semibold mb-2">{title}</div>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{children}</div>
              </div>
            );

            return (
              <div className="space-y-4">
                {structured.whatIs && <Card title="Qué es (explicación simple)">{structured.whatIs}</Card>}
                {structured.whyItMatters && <Card title="Por qué importa">{structured.whyItMatters}</Card>}

                {structured.howToApply && structured.howToApply.length > 0 && (
                  <div className="bg-dark-tertiary rounded-xl border border-gray-600 p-4">
                    <div className="text-white font-semibold mb-2">Cómo aplicarlo (paso a paso)</div>
                    <ol className="space-y-2 list-decimal list-inside text-gray-300 text-sm">
                      {structured.howToApply.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {structured.simpleExample && <Card title="Ejemplo fácil">{structured.simpleExample}</Card>}

                {structured.tips && structured.tips.length > 0 && (
                  <div className="bg-violet/10 rounded-xl border border-violet/20 p-4">
                    <div className="text-white font-semibold mb-2">Tips rápidos</div>
                    <ul className="space-y-2 text-gray-200 text-sm">
                      {structured.tips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">- {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {structured.commonMistakes && structured.commonMistakes.length > 0 && (
                  <div className="bg-red-500/10 rounded-xl border border-red-500/20 p-4">
                    <div className="text-white font-semibold mb-2">Errores comunes</div>
                    <ul className="space-y-2 text-gray-200 text-sm">
                      {structured.commonMistakes.map((m, idx) => (
                        <li key={idx} className="leading-relaxed">- {m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {structured.tools && structured.tools.length > 0 && (
                  <div className="bg-dark-tertiary rounded-xl border border-gray-600 p-4">
                    <div className="text-white font-semibold mb-2">Herramientas recomendadas</div>
                    <div className="space-y-3">
                      {structured.tools.map((t, idx) => (
                        <div key={idx} className="rounded-lg border border-gray-700 p-3 bg-dark-secondary">
                          <div className="text-gray-100 font-medium">{t.name}</div>
                          <div className="text-gray-300 text-sm mt-1">{t.why}</div>
                          {t.link && (
                            <a
                              href={t.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-2 text-sm text-violet hover:underline"
                            >
                              Ver herramienta
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {structured.checklist && structured.checklist.length > 0 && (
                  <div className="bg-green-500/10 rounded-xl border border-green-500/20 p-4">
                    <div className="text-white font-semibold mb-2">Checklist</div>
                    <ul className="space-y-2 text-gray-200 text-sm">
                      {structured.checklist.map((c, idx) => (
                        <li key={idx} className="leading-relaxed">- {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Key Points */}
        {lesson.keyPoints.length > 0 && (
          <div className="mt-8 p-4 bg-violet/10 border border-violet/20 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Puntos Clave</h3>
            <ul className="space-y-2">
              {lesson.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-violet mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              {hasPrevious && (
                <button
                  onClick={onPrevious}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Anterior
                </button>
              )}
              
              {completed && (
                <button
                  onClick={() => handleSaveForLater()}
                  disabled={saved}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    saved 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-violet text-white hover:bg-violet/90'
                  }`}
                >
                  {saved ? 'Guardado' : 'Guardar para después'}
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              {hasNext && (
                <button
                  onClick={onNext}
                  className="px-4 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 transition-colors"
                >
                  Siguiente
                </button>
              )}
              
              {!completed && (
                <button
                  onClick={() => handleMarkComplete()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Marcar como completado
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseLessonView;
