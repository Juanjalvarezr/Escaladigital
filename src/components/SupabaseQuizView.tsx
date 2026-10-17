import React, { useState, useEffect } from 'react';
import { useAuth } from './SupabaseAuthProvider';
import { supabase } from '../supabase';
import { Quiz, getQuizById, calculateScore, hasPassedQuiz } from '../data/quizzes';
import { geminiService } from '../services/gemini';
import { getCompanyIdForUser, recordLearningEvent } from '../services/learningEvents';

interface SupabaseQuizViewProps {
  moduleId: string;
  onComplete: (score: number) => void;
  onRetry: () => void;
}

export const SupabaseQuizView: React.FC<SupabaseQuizViewProps> = ({ moduleId, onComplete, onRetry }) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
    }
  }, [user]);

  const loadQuiz = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoadError(null);
      const { data, error } = await supabase
        .from('user_quizzes')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error loading quiz:', error);
        return;
      }

      if (data) {
        setQuiz({
          id: data.id,
          moduleId: data.module_id,
          title: data.title || 'Quiz de Evaluación',
          description: data.description || 'Evaluación del módulo',
          questions: data.questions,
          passingScore: data.passing_score || 70,
          timeLimit: data.time_limit || 30,
          attemptsAllowed: data.attempts_allowed || 3
        });
      } else {
        // Usar quiz local
        const localQuiz = getQuizById(`quiz-${moduleId}`);
        
        if (localQuiz) {
          setQuiz(localQuiz);
          const { error: quizUpsertError } = await supabase.from('user_quizzes').upsert({
            user_id: user.id,
            module_id: moduleId,
            questions: localQuiz.questions
          }, { onConflict: 'user_id,module_id' });
          if (quizUpsertError) setLoadError('Evaluación disponible localmente; no se pudo sincronizar.');
        } else {
          // Generar quiz con Gemini
          const businessContext = user?.user_metadata?.company || 'Negocio local';
          const questions = await geminiService.generateQuizQuestions(moduleId, businessContext, 'basic');

          const newQuiz: Quiz = {
            id: `quiz-${moduleId}`,
            moduleId,
            title: 'Quiz de Evaluación',
            description: 'Evaluación del módulo',
            questions: questions.map((q, index) => ({
              id: `q-${index}`,
              question: q.question,
              type: 'multiple-choice' as const,
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || '',
              points: 20
            })),
            passingScore: 70,
            timeLimit: 30,
            attemptsAllowed: 3
          };

          // Save to Supabase
          setQuiz(newQuiz);
          const { error: insertError } = await supabase.from('user_quizzes').upsert({
            user_id: user.id,
            module_id: moduleId,
            questions: newQuiz.questions
          }, { onConflict: 'user_id,module_id' });
          if (insertError) setLoadError('Evaluación generada localmente; no se pudo sincronizar.');
        }
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      setLoadError('No se pudo sincronizar la evaluación. Puedes continuar con la copia local si está disponible.');
    } finally {
      setLoading(false);
    }
  }, [moduleId, user]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    setSubmitting(true);
    setSubmitError(null);
    
    try {
      // Calculate score
      const answers = Object.fromEntries(
        quiz.questions.map((question, index) => [question.id, selectedAnswers[index]])
      );
      const score = calculateScore(quiz, answers);
      const passed = hasPassedQuiz(score, quiz.passingScore);

      void recordLearningEvent({
        companyId: getCompanyIdForUser(user),
        userId: user.id,
        eventType: 'quiz_completed',
        moduleKey: moduleId,
        quizKey: quiz.id || `quiz-${moduleId}`,
        eventProperties: {
          score,
          passed,
          passingScore: quiz.passingScore,
          answerCount: selectedAnswers.length
        }
      });

      // Save quiz results
      const { error } = await supabase
        .from('user_quizzes')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          questions: quiz.questions,
          user_answers: selectedAnswers,
          score: score,
          passed: passed,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,module_id' });

      if (error) {
        console.error('Error submitting quiz:', error);
        setSubmitError('Resultado calculado, pero no se pudo sincronizar. Reintenta cuando vuelva la conexión.');
      }

      // Update module progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching progress:', progressError);
        setSubmitError('Resultado calculado, pero el progreso no se pudo sincronizar.');
      } else if (progressData) {
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            quiz_score: score,
            status: passed ? 'completed' : progressData.status,
            completion_percentage: passed ? 100 : progressData.completion_percentage,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('module_id', moduleId);

        if (updateError) {
          console.error('Error updating progress:', updateError);
          setSubmitError('Resultado calculado, pero el progreso no se pudo sincronizar.');
        }
      }

      setShowResults(true);
      onComplete(score);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

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
          <p className="text-gray-400">Necesitas una sesión para ver esta evaluación.</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4 text-center">
        <div className="max-w-md bg-dark-secondary rounded-2xl border border-gray-700 p-8 shadow-xl">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">No se pudo cargar la evaluación</h3>
          <p className="text-gray-400 text-sm mb-6">
            No pudimos sincronizar las preguntas de este módulo o hubo un problema de conexión.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setLoading(true);
                loadQuiz();
              }}
              className="flex-1 py-2.5 px-4 bg-violet hover:bg-violet/90 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 py-2.5 px-4 bg-dark-tertiary hover:bg-gray-700 text-gray-300 font-semibold text-sm rounded-xl border border-gray-600 transition-colors"
            >
              Volver al módulo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const answers = Object.fromEntries(
      quiz.questions.map((question, index) => [question.id, selectedAnswers[index]])
    );
    const score = calculateScore(quiz, answers);
    const passed = hasPassedQuiz(score, quiz.passingScore);
    const correctAnswers = quiz.questions.filter((question, index) =>
      selectedAnswers[index] === question.correctAnswer
    ).length;

    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="bg-dark-secondary rounded-2xl border border-gray-700 p-6 sm:p-8 text-center shadow-xl">
          {submitError && (
            <div role="alert" className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200 text-left">
              <div className="font-semibold mb-1">Aviso de sincronización remota:</div>
              <p>{submitError}</p>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-3 px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold rounded-lg border border-amber-500/40 transition-colors flex items-center space-x-1.5"
              >
                <span>🔄</span>
                <span>{submitting ? 'Reintentando...' : 'Reintentar guardar en Supabase'}</span>
              </button>
            </div>
          )}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            passed ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <svg className={`w-10 h-10 ${passed ? 'text-green-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 20 20">
              {passed ? (
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              )}
            </svg>
          </div>

          <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {passed ? '¡Felicidades! Evaluación Aprobada' : 'Sigue intentando'}
          </h2>

          <p className="text-gray-300 mb-6">
            Tu puntaje: <span className="text-2xl font-bold text-white">{score}%</span>
          </p>
          <div className="grid grid-cols-2 gap-3 text-left mb-6">
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3">
              <div className="text-xs text-gray-400">Respuestas correctas</div>
              <div className="text-xl font-bold text-green-400">{correctAnswers}/{quiz.questions.length}</div>
            </div>
            <div className="rounded-xl bg-violet/10 border border-violet/20 p-3">
              <div className="text-xs text-gray-400">Puntaje mínimo</div>
              <div className="text-xl font-bold text-violet">{quiz.passingScore}%</div>
            </div>
          </div>

          <p className="text-gray-400 mb-8 text-sm">
            {passed 
              ? 'Has demostrado el dominio de los conceptos esenciales para escalar esta área.' 
              : `Necesitas al menos ${quiz.passingScore}% para aprobar. Revisa las explicaciones de abajo e intenta nuevamente.`
            }
          </p>

          <div className="text-left space-y-3 mb-8">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider text-gray-400">Retroalimentación por pregunta</h3>
            {quiz.questions.map((question, index) => {
              const correct = selectedAnswers[index] === question.correctAnswer;
              return (
                <div key={question.id} className={`rounded-xl border p-3.5 ${
                  correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                }`}>
                  <div className="flex gap-2 text-sm">
                    <span aria-hidden="true">{correct ? '✅' : '❌'}</span>
                    <span className="text-gray-200 font-medium">{question.question}</span>
                  </div>
                  {!correct && (
                    <p className="text-xs text-gray-400 mt-2 bg-dark-bg/60 p-2.5 rounded-lg border border-gray-800">
                      💡 {question.explanation || 'Repasa los puntos clave del módulo antes de reintentar.'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {!passed && (
              <button
                onClick={onRetry}
                className="flex-1 py-3 bg-violet text-white font-bold rounded-xl hover:bg-violet/90 transition-colors shadow-lg"
              >
                Reintentar Evaluación
              </button>
            )}
            
            <button
              onClick={() => window.history.back()}
              className="flex-1 py-3 border border-gray-600 text-gray-300 font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Volver a las Lecciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredTotal = selectedAnswers.filter((ans) => ans !== undefined).length;
  const unansweredIndices = quiz.questions
    .map((_, idx) => (selectedAnswers[idx] === undefined ? idx + 1 : null))
    .filter((n): n is number => n !== null);
  const isAllAnswered = unansweredIndices.length === 0;

  return (
    <div className="max-w-3xl mx-auto p-3 sm:p-6">
      <div className="bg-dark-secondary rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
        {loadError && (
          <div role="status" className="border-b border-amber-500/40 bg-amber-500/10 p-3 text-xs sm:text-sm text-amber-200">
            {loadError}
          </div>
        )}
        {/* Progress Bar */}
        <div className="h-2 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-violet to-electric-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs sm:text-sm font-bold text-white">
                Pregunta {currentQuestion + 1} de {quiz.questions.length}
              </span>
              <span className="text-xs text-gray-400 ml-2">
                ({answeredTotal}/{quiz.questions.length} respondidas)
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-dark-tertiary px-2.5 py-1 rounded-full border border-gray-700">
              ⏱️ {quiz.timeLimit} min sugeridos
            </span>
          </div>
        </div>

        {/* Question Selector Dots */}
        <div className="px-4 sm:px-6 py-2.5 bg-dark-bg/60 border-b border-gray-800 flex items-center space-x-2 overflow-x-auto">
          {quiz.questions.map((_, idx) => {
            const isAnswered = selectedAnswers[idx] !== undefined;
            const isCurrent = idx === currentQuestion;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentQuestion(idx)}
                aria-label={`Ir a la pregunta ${idx + 1}`}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center flex-shrink-0 ${
                  isCurrent
                    ? 'ring-2 ring-violet bg-violet text-white'
                    : isAnswered
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-dark-tertiary text-gray-400 border border-gray-700 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Question */}
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center space-x-3.5 ${
                    isSelected
                      ? 'border-violet bg-violet/15 shadow-md shadow-violet/10'
                      : 'border-gray-700 bg-dark-tertiary/40 hover:border-gray-600 hover:bg-dark-tertiary'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'border-violet bg-violet'
                      : 'border-gray-500'
                  }`}>
                    {isSelected && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-sm sm:text-base ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Missing answers alert on final question */}
        {currentQuestion === quiz.questions.length - 1 && !isAllAnswered && (
          <div className="mx-4 sm:mx-6 mb-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-200">
            <span>⚠️ Faltan preguntas por contestar ({unansweredIndices.join(', ')}).</span>
            <button
              type="button"
              onClick={() => setCurrentQuestion(unansweredIndices[0] - 1)}
              className="ml-2 font-bold underline hover:text-white"
            >
              Ir a la pregunta {unansweredIndices[0]}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="p-4 sm:p-6 border-t border-gray-700 bg-dark-bg/20">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold border border-gray-700"
            >
              ← Anterior
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={
                selectedAnswers[currentQuestion] === undefined ||
                submitting ||
                (currentQuestion === quiz.questions.length - 1 && !isAllAnswered)
              }
              className="px-6 py-2.5 bg-violet text-white rounded-xl hover:bg-violet/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-bold shadow-lg shadow-violet/20"
            >
              {submitting ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Enviando...</span>
                </span>
              ) : currentQuestion === quiz.questions.length - 1 ? (
                'Enviar Respuestas'
              ) : (
                'Siguiente →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseQuizView;
