import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './SupabaseAuthProvider';
import { supabase } from '../supabase';
import { 
  User, 
  Building2, 
  Package, 
  Briefcase, 
  Laptop, 
  Store, 
  Lightbulb, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

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
  actividad: string;
  intereses: string;
  description: string;
}

interface UserActivityFormProps {
  onSubmit: (data: BusinessProfileData) => void;
  initial?: Partial<BusinessProfileData>;
}

const BUSINESS_TYPE_OPTIONS = [
  { value: 'Servicio', label: 'Servicios Profesionales', icon: Briefcase, desc: 'Consultoría, agencias, asesorías o servicios B2B/B2C' },
  { value: 'Producto físico', label: 'Productos Físicos', icon: Package, desc: 'Manufactura, artesanías, envíos o comercio de productos' },
  { value: 'Producto digital', label: 'Digital / Cursos', icon: Laptop, desc: 'Infoproductos, software, membresías o cursos' },
  { value: 'Tienda o comercio', label: 'Comercio Local', icon: Store, desc: 'Punto de venta físico, local comercial o franquicia' },
  { value: 'Aún estoy explorando', label: 'Idea / Explorando', icon: Lightbulb, desc: 'Validando un nuevo modelo de negocio' }
];

const STAGE_OPTIONS = [
  { value: 'Idea', label: '💡 Idea o Validación' },
  { value: 'Inicio', label: '🌱 Primeros pasos' },
  { value: 'Ventas', label: '📈 Primeras ventas recurrentes' },
  { value: 'Crecimiento', label: '🚀 Escalando y optimizando' }
];

const GOAL_SUGGESTIONS = [
  'Aumentar clientes y ventas de forma predecible',
  'Automatizar y digitalizar procesos para ahorrar tiempo',
  'Mejorar márgenes de rentabilidad y control financiero',
  'Crear una oferta clara y aprender a venderla mejor'
];

const TIME_OPTIONS = ['Menos de 2 horas', '2 a 5 horas', '5 a 10 horas', 'Más de 10 horas'];

const UserActivityForm: React.FC<UserActivityFormProps> = ({ onSubmit, initial = {} }) => {
  const { user, session, updateUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<BusinessProfileData>({
    nombre: initial.nombre || '',
    companyName: initial.companyName || '',
    businessType: initial.businessType || 'Servicio',
    businessStage: initial.businessStage || 'Inicio',
    industry: initial.industry || '',
    niche: initial.niche || '',
    offer: initial.offer || '',
    idealClient: initial.idealClient || '',
    goals: initial.goals || '',
    timeAvailable: initial.timeAvailable || '2 a 5 horas',
    employees: initial.employees || '1-5',
    learningArea: initial.learningArea || [],
    actividad: initial.actividad || initial.businessType || 'Servicio',
    intereses: initial.intereses || initial.industry || '',
    description: initial.description || ''
  });

  const updateField = (field: keyof BusinessProfileData, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      try {
        const existing = JSON.parse(window.localStorage.getItem('escala:userProfile:v1') || '{}');
        window.localStorage.setItem('escala:userProfile:v1', JSON.stringify({ ...existing, ...updated }));
      } catch {
        // storage fallback
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setDirection(1);
      setStep(prev => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(prev => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    const payload: BusinessProfileData = {
      ...form,
      actividad: form.businessType,
      intereses: [form.industry, form.niche].filter(Boolean).join(', '),
      description: `Oferta: ${form.offer || form.businessType}. Cliente ideal: ${form.idealClient || 'Público objetivo'}.`
    };

    try {
      window.localStorage.setItem('escala:userProfile:v1', JSON.stringify(payload));
    } catch {
      // storage
    }

    setIsSaving(true);
    onSubmit(payload);

    try {
      if (user && session?.user) {
        await updateUserProfile({
          displayName: payload.nombre,
          company: payload.companyName || undefined,
          interests: payload.intereses ? payload.intereses.split(',').map(s => s.trim()).filter(Boolean) : undefined
        });

        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: payload.nombre,
          company: payload.companyName,
          industry: payload.industry,
          employees_count: payload.employees || null,
          business_description: payload.description,
          goals: payload.goals,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Persist profile non-blocking error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.35, ease: 'easeOut' as const }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.25, ease: 'easeIn' as const }
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 sm:p-6 relative overflow-hidden">
      {/* Glow ambiental de fondo */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-electric-blue rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none" />

      <div className="w-full max-w-2xl bg-dark-secondary/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-800 p-6 sm:p-10 relative z-10">
        
        {/* Cabecera del Wizard con indicador de progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-2">
            <span className="flex items-center gap-1.5 text-electric-blue">
              <Sparkles className="w-4 h-4" />
              Paso {step} de 3
            </span>
            <span>{step === 1 ? 'Sobre ti y tu negocio' : step === 2 ? 'Tu oferta y clientes' : 'Metas y disponibilidad'}</span>
            <span className="tabular-nums text-gray-400">{Math.round((step / 3) * 100)}%</span>
          </div>

          <div className="w-full h-2 bg-dark-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-electric-blue via-violet to-cyan-400 rounded-full"
              initial={{ width: '33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Tarjetas Deslizables */}
        <div className="min-h-[420px] flex flex-col justify-between">
          <AnimatePresence custom={direction} mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">¿Quién eres y qué tipo de negocio tienes?</h2>
                  <p className="text-sm text-gray-400 mt-1">Personalizaremos tu ruta estratégica a tu realidad actual.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">¿Cómo te llamas?</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={e => updateField('nombre', e.target.value)}
                        placeholder="Tu nombre (Ej: Juan Álvarez)"
                        className="w-full pl-10 pr-4 py-3 bg-dark-tertiary border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nombre de tu empresa <span className="text-gray-500">(opcional)</span></label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={form.companyName}
                        onChange={e => updateField('companyName', e.target.value)}
                        placeholder="Ej: Escala Studio"
                        className="w-full pl-10 pr-4 py-3 bg-dark-tertiary border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">Selecciona el tipo de negocio que mejor te describe:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {BUSINESS_TYPE_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const selected = form.businessType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField('businessType', opt.value)}
                          className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all ${
                            selected
                              ? 'bg-electric-blue/15 border-electric-blue text-white shadow-md shadow-electric-blue/10'
                              : 'bg-dark-tertiary/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-dark-tertiary'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${selected ? 'bg-electric-blue text-white' : 'bg-gray-800 text-gray-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-tight">{opt.label}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">¿En qué etapa te encuentras?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STAGE_OPTIONS.map(opt => {
                      const selected = form.businessStage === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField('businessStage', opt.value)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                            selected
                              ? 'bg-violet-600/20 border-violet-500 text-white shadow-sm'
                              : 'bg-dark-tertiary/50 border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Tu oferta y tu cliente ideal</h2>
                  <p className="text-sm text-gray-400 mt-1">Con esto la IA seleccionará ejemplos y plantillas de tu propio sector.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">¿Cuál es tu industria o nicho específico?</label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={e => updateField('industry', e.target.value)}
                    placeholder="Ej: Marketing inmobiliario, Consultoría de finanzas, E-commerce de moda..."
                    className="w-full px-4 py-3 bg-dark-tertiary border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">¿Qué producto o servicio vendes concretamente?</label>
                  <textarea
                    rows={3}
                    value={form.offer}
                    onChange={e => updateField('offer', e.target.value)}
                    placeholder="Ej: Paquetes de gestión de redes sociales y diseño web para pymes locales..."
                    className="w-full px-4 py-3 bg-dark-tertiary border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue text-sm resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">¿Quién es la persona o empresa que más te compra?</label>
                  <textarea
                    rows={2}
                    value={form.idealClient}
                    onChange={e => updateField('idealClient', e.target.value)}
                    placeholder="Ej: Dueños de restaurantes o negocios locales que no tienen tiempo de manejar su marketing..."
                    className="w-full px-4 py-3 bg-dark-tertiary border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue text-sm resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Tus metas y disponibilidad</h2>
                  <p className="text-sm text-gray-400 mt-1">Diseñaremos la velocidad y pasos clave de tu ruta.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">¿Cuál es tu meta principal para los próximos meses?</label>
                  
                  {/* Sugerencias de 1 clic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {GOAL_SUGGESTIONS.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => updateField('goals', goal)}
                        className={`p-2.5 text-xs text-left rounded-xl border transition-all ${
                          form.goals === goal
                            ? 'bg-electric-blue/15 border-electric-blue text-white'
                            : 'bg-dark-tertiary/40 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 inline mr-1.5 ${form.goals === goal ? 'text-electric-blue' : 'text-gray-600'}`} />
                        {goal}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={form.goals}
                    onChange={e => updateField('goals', e.target.value)}
                    placeholder="O escribe tu objetivo con tus propias palabras..."
                    className="w-full px-4 py-3 bg-dark-tertiary border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-electric-blue" />
                    ¿Cuánto tiempo semanal puedes dedicar a aplicar las mejoras?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIME_OPTIONS.map(time => {
                      const selected = form.timeAvailable === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => updateField('timeAvailable', time)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                            selected
                              ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                              : 'bg-dark-tertiary/50 border-gray-800 text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-electric-blue/10 to-violet/10 border border-electric-blue/20">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-electric-blue shrink-0" />
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Con estos datos, la IA generará una ruta de escalabilidad adaptada exactamente a tu industria, con prioridades y talleres prácticos.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botones de navegación inferiores */}
          <div className="pt-8 border-t border-gray-800 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:bg-dark-tertiary transition-all text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={isSaving || (step === 1 && !form.nombre.trim()) || (step === 2 && !form.industry.trim())}
              onClick={handleNext}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-violet text-white font-bold shadow-lg shadow-violet-500/25 hover:opacity-95 transform hover:-translate-y-0.5 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{isSaving ? 'Generando ruta...' : step === 3 ? 'Generar Mi Ruta con IA 🚀' : 'Siguiente paso'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserActivityForm;
