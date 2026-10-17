import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import { readUserDiagnostic } from '../utils/userScopedStorage';
import { DiagnosticResult } from '../services/gemini';

const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(false);

  // Detectar si el usuario tiene diagnóstico guardado (regresa a la app)
  const hasSavedJourney = Boolean(readUserDiagnostic<DiagnosticResult>(null) || (user?.id ? readUserDiagnostic<DiagnosticResult>(user.id) : null));
  const isRegisteredUser = Boolean(user?.email && !user.id?.startsWith('guest_'));

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Si ya hay usuario registrado, ir al dashboard
    if (isRegisteredUser) {
      navigate('/dashboard');
    }
    // Si tiene diagnóstico guardado, ir a su ruta
    else if (hasSavedJourney) {
      navigate('/mi-ruta');
    }
  }, [isRegisteredUser, hasSavedJourney, navigate]);

  const handleStart = () => {
    // Ir directamente al formulario, sin pantalla intermedia
    navigate('/?start=diagnostic');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-6xl w-full">
        <div className="text-center">
          {/* Logo */}
          <div className={`transform transition-all duration-1000 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl mb-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <span className="text-4xl">🚀</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                ESCALA
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                DIGITAL
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Diagnostica tu negocio con IA y obtén una
              <span className="text-violet-400 font-bold"> ruta de escalabilidad personalizada</span>
              <br />
              en menos de 2 minutos
            </p>
          </div>

          {/* Cards de beneficios */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 transition-all duration-1000 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-3">
                <span className="text-xl">🤖</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">IA Personalizada</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Diagnóstico que analiza tu negocio y crea una hoja de ruta única
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-3">
                <span className="text-xl">📈</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Resultados Reales</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Estrategias prácticas con impacto medible y talleres aplicados
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 text-left">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sistema Escalable</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Módulos que crecen contigo, desde fundamentos hasta estrategias avanzadas
              </p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className={`flex flex-wrap justify-center gap-10 mb-14 transition-all duration-1000 delay-500 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center">
              <div className="text-4xl font-bold text-violet-400 mb-1">500+</div>
              <div className="text-gray-400 text-sm">Empresas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-1">98%</div>
              <div className="text-gray-400 text-sm">Satisfacción</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-1">2 min</div>
              <div className="text-gray-400 text-sm">Para tu ruta IA</div>
            </div>
          </div>

          {/* CTAs */}
          <div className={`flex flex-col items-center gap-4 transition-all duration-1000 delay-700 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* CTA Principal */}
            <button
              id="intro-start-btn"
              onClick={handleStart}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xl font-bold rounded-2xl hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-violet-500/50 transform transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl"
            >
              <span>Comenzar Diagnóstico IA</span>
              <span className="text-2xl">🎯</span>
            </button>
            
            <p className="text-gray-500 text-xs">
              Gratis • Sin tarjeta de crédito • Tus datos seguros
            </p>

            {/* Login secundario para usuarios existentes */}
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="mt-2 text-sm text-gray-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
