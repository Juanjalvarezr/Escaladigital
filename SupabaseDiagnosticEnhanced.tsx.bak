import React, { useState } from 'react';
import { geminiService, DiagnosticResult } from '../services/gemini';
import { useAuth } from './SupabaseAuthProvider';
import { supabase } from '../supabase';
import { BUSINESS_AREAS } from '../types';
import { getCompanyIdForUser, recordLearningEvent } from '../services/learningEvents';

interface SupabaseDiagnosticEnhancedProps {
  onComplete: (result: DiagnosticResult) => void;
}

interface DiagnosticFormData {
  contactName: string;
  companyName: string;
  industry: string;
  businessDescription: string;
  mainChallenge: string;
  interests: string[];
}

type AreaStatus = 'defined' | 'not_defined';

const STORAGE_FORM_KEY = 'escala:diagnosticForm:v2';
const STORAGE_STEP_KEY = 'escala:diagnosticStep:v1';
const STORAGE_RESULT_KEY = 'escala:latestDiagnosticResult:v1';

export const SupabaseDiagnosticEnhanced: React.FC<SupabaseDiagnosticEnhancedProps> = ({ onComplete }) => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState<DiagnosticFormData>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_FORM_KEY);
      if (!raw) {
        return {
          contactName: '',
          companyName: '',
          industry: '',
          businessDescription: '',
          mainChallenge: '',
          interests: []
        };
      }
      const parsed = JSON.parse(raw) as Partial<DiagnosticFormData>;
      return {
        contactName: parsed.contactName || '',
        companyName: parsed.companyName || '',
        industry: parsed.industry || '',
        businessDescription: parsed.businessDescription || '',
        mainChallenge: parsed.mainChallenge || '',
        interests: Array.isArray(parsed.interests) ? parsed.interests : []
      };
    } catch {
      return {
        contactName: '',
        companyName: '',
        industry: '',
        businessDescription: '',
        mainChallenge: '',
        interests: []
      };
    }
  });
  const [step, setStep] = useState<number>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_STEP_KEY);
      return raw ? parseInt(raw, 10) : 1;
    } catch {
      return 1;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const [completed, setCompleted] = useState(false);

  const persistStep = (next: number) => {
    try {
      window.localStorage.setItem(STORAGE_STEP_KEY, String(next));
    } catch {
      // ignore
    }
  };

  const clearSavedForm = () => {
    try {
      window.localStorage.removeItem(STORAGE_FORM_KEY);
      window.localStorage.removeItem(STORAGE_STEP_KEY);
    } catch {
      // ignore
    }
  };

  const markResumeAvailable = () => {
    try {
      const hasForm = Boolean(window.localStorage.getItem(STORAGE_FORM_KEY));
      const hasResult = Boolean(window.localStorage.getItem(STORAGE_RESULT_KEY));
      setResumeAvailable(hasForm || hasResult);
    } catch {
      setResumeAvailable(false);
    }
  };

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error(message)), timeoutMs))
    ]);
  };

  const withRetry = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    baseDelayMs: number = 2000
  ): Promise<T> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        const delay = baseDelayMs * Math.pow(2, attempt); // Exponential backoff
        console.warn(`Intento ${attempt + 1} falló, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Máximo de reintentos alcanzado');
  };

  const handleInputChange = (field: keyof DiagnosticFormData, value: string | string[]) => {
    setFormData(prev => {
      const next = {
        ...prev,
        [field]: value
      } as DiagnosticFormData;

      try {
        window.localStorage.setItem(STORAGE_FORM_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn('LocalStorage no disponible al guardar formulario:', error);
        // Fallback: intentar sessionStorage
        try {
          sessionStorage.setItem(STORAGE_FORM_KEY, JSON.stringify(next));
        } catch (sessionError) {
          console.warn('SessionStorage tampoco disponible:', sessionError);
        }
      }

      return next;
    });
  };

  const handleInterestToggle = (areaId: string) => {
    setFormData(prev => {
      const next: DiagnosticFormData = {
        ...prev,
        interests: prev.interests.includes(areaId)
          ? prev.interests.filter(id => id !== areaId)
          : [...prev.interests, areaId]
      };

      try {
        window.localStorage.setItem(STORAGE_FORM_KEY, JSON.stringify(next));
      } catch (error) {
        console.warn('LocalStorage no disponible al guardar formulario:', error);
        // Fallback: intentar sessionStorage
        try {
          sessionStorage.setItem(STORAGE_FORM_KEY, JSON.stringify(next));
        } catch (sessionError) {
          console.warn('SessionStorage tampoco disponible:', sessionError);
        }
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contactName.trim() || !formData.companyName.trim() || !formData.businessDescription.trim() || !formData.mainChallenge.trim()) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    if (formData.interests.length === 0) {
      setError('Por favor selecciona al menos un área de interés');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const businessContext = `${formData.contactName} - ${formData.companyName}. ${formData.industry}. ${formData.businessDescription}`;
      
      const baseResult = await withRetry(
        () => withTimeout(
          geminiService.analyzeBusiness({ description: businessContext, goals: formData.mainChallenge, actividad: formData.industry }),
          45_000, // Aumentado a 45 segundos
          'Tiempo de espera agotado al generar tu ruta (45s). Por favor intenta de nuevo.'
        ),
        2, // 2 reintentos
        3000 // 3 segundos de delay base
      );

      const mergedModules = Array.from(
        new Set([...(baseResult.recommendedModules || []), ...formData.interests])
      );

      const result: DiagnosticResult = {
        ...baseResult,
        recommendedModules: mergedModules,
        organizationalAreas: Object.fromEntries(
          BUSINESS_AREAS.map(area => [area.id, formData.interests.includes(area.id) ? 'defined' : 'not_defined'])
        ) as Record<string, AreaStatus>
      };

      try {
        window.localStorage.setItem(STORAGE_RESULT_KEY, JSON.stringify(result));
      } catch (error) {
        console.warn('LocalStorage no disponible al guardar resultado:', error);
        try {
          sessionStorage.setItem(STORAGE_RESULT_KEY, JSON.stringify(result));
        } catch (sessionError) {
          console.warn('SessionStorage tampoco disponible:', sessionError);
        }
      }
      
      // Save diagnostic result to Supabase
      if (user) {
        const { error: insertError } = await supabase
          .from('user_diagnostics')
          .insert({
            user_id: user.id,
            business_type: formData.industry,
            main_challenge: formData.mainChallenge,
            business_description: businessContext,
            scalability_roadmap: result.scalabilityRoadmap,
            recommended_modules: result.recommendedModules
          });

        if (insertError) {
          console.error('Error saving diagnostic:', insertError);
          setError(`Se generó el plan, pero no se pudo guardar en Supabase: ${insertError.message}`);
        }

        void recordLearningEvent({
          companyId: getCompanyIdForUser(user),
          userId: user.id,
          eventType: 'diagnostic_completed',
          eventProperties: {
            businessType: result.businessType,
            mainChallenge: result.mainChallenge,
            recommendedModules: result.recommendedModules
            ,
            organizationalAreas: result.organizationalAreas,
            selectedAreaCount: formData.interests.length,
            totalAreaCount: BUSINESS_AREAS.length
          }
        });

        try {
          await updateUserProfile({
            displayName: formData.contactName,
            company: formData.companyName,
            industry: formData.industry,
            interests: formData.interests
          });
        } catch (profileError) {
          console.error('Error updating profile:', profileError);
        }
      } else {
        setError('Sesión no disponible: se generará el plan, pero no se guardará en Supabase.');
      }

      onComplete(result);
      finish();
    } catch (error) {
      console.error('Error in diagnostic:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setError(`No se pudo generar la ruta. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'Retail',
    'Servicios Profesionales',
    'Tecnología',
    'Salud',
    'Educación',
    'Restaurantes',
    'Manufactura',
    'Construcción',
    'Finanzas',
    'Consultoría',
    'E-commerce',
    'Turismo',
    'Transporte',
    'Otro'
  ];

  useEffect(() => {
    markResumeAvailable();
  }, [formData]);

  useEffect(() => {
    persistStep(step);
  }, [step]);

  const goToStep = (next: number) => {
    setStep(next);
    persistStep(next);
  };

  const resumeSaved = () => {
    setError('');
    goToStep(1);
    markResumeAvailable();
  };

  const finish = () => {
    clearSavedForm();
    setCompleted(true);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-dark-secondary rounded-2xl p-8 border border-violet/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Bienvenido a <span className="text-violet">Escala Digital</span>
            </h1>
            <p className="text-gray-300 text-lg">
              Transforma tu negocio tradicional en una entidad digital rentable
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>Paso {step} de 3</span>
              <span className="h-1.5 w-24 rounded-full bg-gray-700">
                <span className="block h-full rounded-full bg-gradient-to-r from-electric-blue to-violet" style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }} />
              </span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              {resumeAvailable && !completed && (
                <button type="button" onClick={resumeSaved} className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800">
                  Continuar diagnóstico guardado
                </button>
              )}
              {resumeAvailable && !completed && (
                <button type="button" onClick={clearSavedForm} className="text-xs px-3 py-1.5 rounded-lg border border-red-700 text-red-200 hover:bg-red-900/40">
                  Borrar avance guardado
                </button>
              )}
              {completed && (
                <span className="text-xs px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-200">
                  Diagnóstico completado
                </span>
              )}
            </div>
          </div>

          {completed ? (
            <div className="space-y-4 text-center">
              <p className="text-white text-lg">Ya generaste tu ruta.</p>
              <p className="text-gray-400 text-sm">Si quieres, puedes generar otra desde tu dashboard o volviendo al inicio.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tu Nombre *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-tertiary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-tertiary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                  placeholder="Ej: Mi Droguería Central"
                  required
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Industria / Nicho de Mercado *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 bg-dark-tertiary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent"
                required
              >
                <option value="">Selecciona tu industria</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción Detallada del Negocio *
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                className="w-full px-4 py-3 bg-dark-tertiary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent resize-none"
                rows={4}
                placeholder="Describe tu negocio: productos/servicios, clientes, mercado objetivo, años de experiencia, número de empleados, etc..."
                required
              />
            </div>

            {/* Main Challenge */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Principal Desafío Actual *
              </label>
              <textarea
                value={formData.mainChallenge}
                onChange={(e) => handleInputChange('mainChallenge', e.target.value)}
                className="w-full px-4 py-3 bg-dark-tertiary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet focus:border-transparent resize-none"
                rows={3}
                placeholder="Ej: No logro atraer clientes nuevos a través de internet, mis ventas dependen solo del tráfico local, no tengo presencia digital..."
                required
              />
            </div>

            {/* Areas of Interest */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                ¿Qué áreas de tu empresa ya identificas? * (Selecciona todas las que actualmente existen o reconoces)
              </label>
                <p className="mb-4 text-sm text-gray-400">
                  No es una calificación. Esta respuesta nos ayuda a mostrarte qué tan completa está hoy la estructura de tu empresa y qué áreas conviene desarrollar para crecer.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {BUSINESS_AREAS.map((area) => {
                    const isSelected = formData.interests.includes(area.id);
                    return (
                      <button
                        type="button"
                        key={area.id}
                        onClick={() => handleInterestToggle(area.id)}
                        aria-pressed={isSelected}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-violet/20 border-violet text-white'
                            : 'bg-dark-tertiary border-gray-600 text-gray-300 hover:border-violet/50'
                        }`}
                      >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{area.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{area.name}</div>
                          <div className="text-xs opacity-75">{area.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 rounded-lg border border-gray-700 bg-dark-tertiary/60 p-4" role="status">
                <p className="font-semibold text-white">
                  {formData.interests.length === BUSINESS_AREAS.length
                    ? 'Excelente: reconoces las 8 áreas clave de tu empresa.'
                    : formData.interests.length >= 4
                      ? `Reconoces ${formData.interests.length} de ${BUSINESS_AREAS.length} áreas. Tienes una base; revisaremos las restantes para fortalecer tu crecimiento.`
                      : `Has identificado ${formData.interests.length} de ${BUSINESS_AREAS.length} áreas. Definir las demás puede ayudarte a organizar mejor y delegar.`}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Las áreas no seleccionadas no desaparecen: se convierten en oportunidades de desarrollo dentro de tu ruta.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-violet to-electric-blue text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 8 0 018-8 8 0 018 8 8 0 018-8 8 8 0 018-8 8 8 0 018-8z"></path>
                  </svg>
                  Analizando tu negocio...
                </span>
              ) : (
                'Generar mi Plan de Escala Digital'
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              🚀 Nuestra IA analizará tu información y creará un plan personalizado para transformar tu negocio
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Tus datos están seguros y solo se usarán para generar recomendaciones personalizadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
