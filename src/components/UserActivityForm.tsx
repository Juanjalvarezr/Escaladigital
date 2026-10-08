import React, { useState } from 'react';
import { useAuth } from './SupabaseAuthProvider';
import { supabase } from '../supabase';

export interface BusinessProfileData {
  nombre: string;
  companyName: string;
  businessType: string;
  businessStage: string;
  industry: string;
  niche: string;
  offer: string;
  idealClient: string;
  goals: string;
  timeAvailable: string;
  employees: string;
  learningArea: string[];
  // Legacy fields kept for the diagnostic flow.
  actividad: string;
  intereses: string;
  description: string;
}

interface UserActivityFormProps {
  onSubmit: (data: BusinessProfileData) => void;
  initial?: Partial<BusinessProfileData>;
}

const inputClassName = 'mt-2 block w-full bg-dark-tertiary border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-electric-blue focus:border-transparent outline-none transition-all';
const selectClassName = `${inputClassName} appearance-none`;
const FORM_STEP_KEY = 'escala:diagnosticFormStep:v1';

const readFormStep = () => {
  try {
    const step = Number(window.localStorage.getItem(FORM_STEP_KEY));
    return step >= 1 && step <= 3 ? step : 1;
  } catch {
    return 1;
  }
};

const UserActivityForm: React.FC<UserActivityFormProps> = ({ onSubmit, initial = {} }) => {
  const { user, session, updateUserProfile } = useAuth();
  const [formStep, setFormStep] = useState(readFormStep);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<BusinessProfileData>({
    nombre: initial.nombre || '',
    companyName: initial.companyName || '',
    businessType: initial.businessType || '',
    businessStage: initial.businessStage || '',
    industry: initial.industry || '',
    niche: initial.niche || '',
    offer: initial.offer || '',
    idealClient: initial.idealClient || '',
    goals: initial.goals || '',
    timeAvailable: initial.timeAvailable || '',
    employees: initial.employees || '',
    learningArea: initial.learningArea || [],
    actividad: initial.actividad || initial.businessType || '',
    intereses: initial.intereses || initial.industry || '',
    description: initial.description || ''
  });

  const updateField = (field: keyof BusinessProfileData, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
    persist({ [field]: value });
  };

  const persist = (partial: Partial<BusinessProfileData>) => {
    try {
      const existing = JSON.parse(window.localStorage.getItem('escala:userProfile:v1') || '{}');
      window.localStorage.setItem('escala:userProfile:v1', JSON.stringify({ ...existing, ...partial }));
    } catch {
      // Local persistence is a convenience; the form remains usable if it is unavailable.
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (formStep < 3) {
      const nextStep = formStep + 1;
      setFormStep(nextStep);
      try {
        window.localStorage.setItem(FORM_STEP_KEY, String(nextStep));
      } catch {
        // Keep the form usable when browser storage is unavailable.
      }
      return;
    }

    const payload: BusinessProfileData = {
      ...form,
      actividad: form.businessType,
      intereses: [form.industry, form.niche].filter(Boolean).join(', '),
      description: `Oferta: ${form.offer}. Cliente ideal: ${form.idealClient}.`
    };
    persist(payload);
    onSubmit(payload);
    setIsSaving(true);

    try {
      if (user && session?.user) {
        await updateUserProfile({
          displayName: payload.nombre,
          company: payload.companyName || undefined,
          interests: payload.intereses ? payload.intereses.split(',').map(value => value.trim()).filter(Boolean) : undefined
        });
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: payload.nombre,
          company: payload.companyName,
          industry: payload.industry,
          employees_count: payload.employees || null,
          business_description: payload.description,
          goals: payload.goals,
          updated_at: new Date().toISOString()
        });
        if (error) console.warn('Could not upsert profile', error);
      }
    } catch (error) {
      console.warn('Could not persist onboarding profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepIndicators = () => (
    <div className="flex justify-center space-x-2 mb-8" aria-label={`Paso ${formStep} de 3`}>
      {[1, 2, 3].map(step => (
        <div key={step} className={`h-2 rounded-full transition-all duration-300 ${formStep >= step ? 'w-8 bg-electric-blue' : 'w-2 bg-gray-700'}`} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet rounded-full mix-blend-screen filter blur-[100px] opacity-20" />
      <form className="w-full max-w-lg bg-dark-secondary bg-opacity-80 backdrop-filter backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-800 relative z-10" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-extrabold mb-2 text-white">Conozcamos tu negocio</h2>
        <p className="text-gray-400 mb-6">Responde con tus palabras. No necesitas saber términos técnicos.</p>
        <p className="text-sm text-gray-500 mb-4">Paso {formStep} de 3</p>
        {renderStepIndicators()}

        <div className="min-h-[300px]">
          {formStep === 1 && (
            <div className="animate-fade-in space-y-5">
              <label className="block">
                <span className="text-gray-300 font-medium">¿Cómo te llamas?</span>
                <input className={inputClassName} value={form.nombre} onChange={event => updateField('nombre', event.target.value)} placeholder="Ej: María Gómez" required />
              </label>
              <label className="block">
                <span className="text-gray-300 font-medium">Nombre de tu negocio o proyecto <span className="text-gray-500">(opcional)</span></span>
                <input className={inputClassName} value={form.companyName} onChange={event => updateField('companyName', event.target.value)} placeholder="Ej: María Diseña" />
              </label>
              <label className="block">
                <span className="text-gray-300 font-medium">¿Qué tipo de negocio tienes?</span>
                <select className={selectClassName} value={form.businessType} onChange={event => updateField('businessType', event.target.value)} required>
                  <option value="">Selecciona una opción</option>
                  <option value="Producto físico">Vendo productos físicos</option>
                  <option value="Servicio">Ofrezco servicios</option>
                  <option value="Producto digital">Creo cursos o productos digitales</option>
                  <option value="Tienda o comercio">Tengo una tienda o comercio</option>
                  <option value="Aún estoy explorando">Aún estoy explorando mi idea</option>
                  <option value="Otro">Otro tipo de negocio</option>
                </select>
              </label>
              <label className="block">
                <span className="text-gray-300 font-medium">¿En qué etapa estás?</span>
                <select className={selectClassName} value={form.businessStage} onChange={event => updateField('businessStage', event.target.value)} required>
                  <option value="">Selecciona una opción</option>
                  <option value="Idea">Tengo una idea</option>
                  <option value="Inicio">Estoy empezando</option>
                  <option value="Ventas">Ya tengo mis primeras ventas</option>
                  <option value="Crecimiento">Estoy creciendo</option>
                </select>
              </label>
            </div>
          )}

          {formStep === 2 && (
            <div className="animate-fade-in space-y-5">
              <label className="block">
                <span className="text-gray-300 font-medium">Industria o nicho</span>
                <input className={inputClassName} value={form.industry} onChange={event => updateField('industry', event.target.value)} placeholder="Ej: repostería saludable, asesoría financiera" required />
              </label>
              <label className="block">
                <span className="text-gray-300 font-medium">¿Qué ofreces?</span>
                <textarea className={inputClassName} value={form.offer} onChange={event => updateField('offer', event.target.value)} rows={3} placeholder="Cuéntanos qué vendes o qué servicio prestas" required />
              </label>
              <label className="block">
                <span className="text-gray-300 font-medium">¿Quién es tu cliente ideal?</span>
                <textarea className={inputClassName} value={form.idealClient} onChange={event => updateField('idealClient', event.target.value)} rows={3} placeholder="Describe a la persona que más necesita tu oferta" required />
              </label>
            </div>
          )}

          {formStep === 3 && (
            <div className="animate-fade-in space-y-5">
              <label className="block">
                <span className="text-gray-300 font-medium">¿Cuál es tu objetivo principal?</span>
                <textarea className={inputClassName} value={form.goals} onChange={event => updateField('goals', event.target.value)} rows={3} placeholder="Ej: conseguir mis primeros 10 clientes" required />
              </label>
              <label className="block">
                <span className="text-gray-300 font-medium">¿Cuánto tiempo puedes dedicar por semana?</span>
                <select className={selectClassName} value={form.timeAvailable} onChange={event => updateField('timeAvailable', event.target.value)} required>
                  <option value="">Selecciona una opción</option>
                  <option value="Menos de 2 horas">Menos de 2 horas</option>
                  <option value="2 a 5 horas">De 2 a 5 horas</option>
                  <option value="5 a 10 horas">De 5 a 10 horas</option>
                  <option value="Más de 10 horas">Más de 10 horas</option>
                </select>
              </label>
              <p className="text-sm text-gray-400 bg-dark-tertiary rounded-lg p-3">Con estas respuestas prepararemos una ruta inicial adaptada a tu momento actual.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex space-x-3">
          {formStep > 1 && (
            <button type="button" className="flex-1 py-3 px-4 bg-dark-tertiary text-white rounded-xl hover:bg-gray-700 transition" onClick={() => {
              const previousStep = formStep - 1;
              setFormStep(previousStep);
              try {
                window.localStorage.setItem(FORM_STEP_KEY, String(previousStep));
              } catch {
                // Keep the form usable when browser storage is unavailable.
              }
            }}>Atrás</button>
          )}
          <button type="submit" disabled={isSaving} className="flex-[2] py-3 px-4 bg-gradient-to-r from-electric-blue to-violet text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50">
            {isSaving ? 'Guardando...' : formStep === 3 ? 'Continuar' : 'Siguiente'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserActivityForm;
