import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { readUserDiagnostic } from '../utils/userScopedStorage';
import { useAuth } from './SupabaseAuthProvider';
import { Sparkles, ArrowRight, LayoutDashboard, Compass, LogIn } from 'lucide-react';

interface WelcomeScreenProps {
  onContinue: () => void;
  onSkip?: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasSavedJourney = Boolean(readUserDiagnostic(null) || (user?.id ? readUserDiagnostic(user.id) : null));
  const isRegisteredUser = Boolean(user?.email && !user.id.startsWith('guest_'));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg relative overflow-hidden px-4">
      {/* Luces y ambientación de fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[140px] opacity-25 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-blue rounded-full mix-blend-screen filter blur-[140px] opacity-25" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg p-8 sm:p-10 bg-dark-secondary/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 text-center"
      >
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-blue/10 border border-electric-blue/30 text-xs font-semibold text-electric-blue mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transformación de Negocios con IA</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-violet to-cyan-400 mb-4 tracking-tight">
          Escala Digital
        </h1>

        <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
          {hasSavedJourney || isRegisteredUser
            ? '¡Hola de nuevo! Retoma tu diagnóstico o continúa avanzando en las áreas estratégicas de tu empresa.'
            : 'Diagnostica tu modelo de negocio en 2 minutos y obtén una ruta paso a paso personalizada con Inteligencia Artificial.'}
        </p>

        {/* Acciones principales inteligentes */}
        <div className="flex flex-col gap-3.5 w-full">
          {hasSavedJourney || isRegisteredUser ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/mi-ruta')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-white bg-gradient-to-r from-electric-blue to-violet rounded-2xl shadow-lg shadow-violet-500/20 hover:opacity-95 transform hover:-translate-y-0.5 transition-all"
              >
                <Compass className="w-5 h-5" />
                Continuar con mi ruta personalizada
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 font-semibold text-gray-300 bg-dark-tertiary/70 border border-gray-700/80 rounded-2xl hover:bg-gray-800 hover:text-white transition-all"
              >
                <LayoutDashboard className="w-5 h-5 text-gray-400" />
                Ir directo al Dashboard
              </button>
            </>
          ) : (
            <>
              {/* Usuario nuevo: 1 solo llamado a la acción claro y principal */}
              <button
                type="button"
                onClick={onContinue}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 font-bold text-white bg-gradient-to-r from-electric-blue to-violet rounded-2xl shadow-xl shadow-electric-blue/20 hover:opacity-95 transform hover:-translate-y-0.5 transition-all text-lg"
              >
                <span>Comenzar Diagnóstico IA</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-300 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  ¿Ya tienes una cuenta registrada? Iniciar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
