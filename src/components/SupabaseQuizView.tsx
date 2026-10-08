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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400">No se pudo cargar la evaluación</p>
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
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-dark-secondary rounded-xl border border-gray-700 p-8 text-center">
          {submitError && (
            <div role="alert" className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
              {submitError}
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

          <h2 className={`text-3xl font-bold mb-4 ${passed ? 'text-green-400' : 'text-red-400'}`}>
            {passed ? '¡Felicidades!' : 'Sigue intentando'}
          </h2>

          <p className="text-gray-300 mb-6">
            Tu puntaje: <span className="text-2xl font-bold text-white">{score}%</span>
          </p>
          <div className="grid grid-cols-2 gap-3 text-left mb-6">
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <div className="text-xs text-gray-400">Respuestas correctas</div>
              <div className="text-xl font-bold text-green-400">{correctAnswers}/{quiz.questions.length}</div>
            </div>
            <div className="rounded-lg bg-violet/10 border border-violet/20 p-3">
              <div className="text-xs text-gray-400">Puntaje mínimo</div>
              <div className="text-xl font-bold text-violet">{quiz.passingScore}%</div>
            </div>
          </div>

          <p className="text-gray-400 mb-8">
            {passed 
              ? 'Has desbloqueado el siguiente nivel de escala. ¡Sigue así!' 
              : `Necesitas al menos ${quiz.passingScore}% para aprobar. Repasa los materiales e intenta nuevamente.`
            }
          </p>

          <div className="text-left space-y-3 mb-8">
            <h3 className="font-semibold text-white">Retroalimentación por pregunta</h3>
            {quiz.questions.map((question, index) => {
              const correct = selectedAnswers[index] === question.correctAnswer;
              return (
                <div key={question.id} className={`rounded-lg border p-3 ${
                  correct ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                }`}>
                  <div className="flex gap-2 text-sm">
                    <span aria-hidden="true">{correct ? '✅' : '❌'}</span>
                    <span className="text-gray-200">{question.question}</span>
                  </div>
                  {!correct && (
                    <p className="text-xs text-gray-400 mt-2">
                      {question.explanation || 'Repasa esta parte del módulo antes de intentarlo de nuevo.'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            {!passed && (
              <button
                onClick={onRetry}
                className="w-full py-3 bg-violet text-white rounded-lg hover:bg-violet/90 transition-colors"
              >
                Reintentar Evaluación
              </button>
            )}
            
            <button
              onClick={() => window.history.back()}
              className="w-full py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-dark-secondary rounded-xl border border-gray-700 overflow-hidden">
        {loadError && (
          <div role="status" className="border-b border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
            {loadError}
          </div>
        )}
        {/* Progress Bar */}
        <div className="h-2 bg-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-violet to-electric-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Pregunta {currentQuestion + 1} de {quiz.questions.length}
            </span>
            <span className="text-sm text-gray-400">
              {quiz.timeLimit} min disponibles
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-violet bg-violet/10'
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-violet bg-violet'
                      : 'border-gray-500'
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-300">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined || submitting}
              className="px-6 py-2 bg-violet text-white rounded-lg hover:bg-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
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
