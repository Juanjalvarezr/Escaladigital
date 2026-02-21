import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';

const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Animar entrada después de montar
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Si ya hay usuario, ir al dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleStart = () => {
    navigate('/diagnostic');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-6xl w-full">
        <div className="text-center">
          {/* Logo animado */}
          <div className={`transform transition-all duration-1000 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl mb-8 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <span className="text-5xl animate-bounce">🚀</span>
            </div>
            
            {/* Título principal */}
            <h1 className="text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                ESCALA
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                DIGITAL
              </span>
            </h1>
            
            {/* Subtítulo */}
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transforma tu negocio tradicional en una 
              <span className="text-violet-400 font-bold"> máquina digital</span> 
              <br />
              con IA y estrategias probadas
            </p>
          </div>

          {/* Cards de beneficios */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 transition-all duration-1000 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">IA Inteligente</h3>
              <p className="text-gray-300 leading-relaxed">
                Diagnóstico personalizado que analiza tu negocio y crea una ruta única
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Resultados Reales</h3>
              <p className="text-gray-300 leading-relaxed">
                Estrategias prácticas y herramientas que generan impacto medible en tu negocio
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Escalable</h3>
              <p className="text-gray-300 leading-relaxed">
                Sistema modular que crece contigo, desde fundamentals hasta estrategias avanzadas
              </p>
            </div>
          </div>

          {/* Estadísticas de confianza */}
          <div className={`flex flex-wrap justify-center gap-8 mb-16 transition-all duration-1000 delay-500 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center">
              <div className="text-4xl font-bold text-violet-400 mb-2">500+</div>
              <div className="text-gray-400 text-sm">Empresas Transformadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">98%</div>
              <div className="text-gray-400 text-sm">Satisfacción</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Disponibilidad</div>
            </div>
          </div>

          {/* Botón principal de acción */}
          <div className={`transition-all duration-1000 delay-700 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <button
              onClick={handleStart}
              className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xl font-bold rounded-2xl hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-violet-500/50 transform transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl"
            >
              <span className="relative z-10">Comenzar Transformación</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="text-2xl relative z-10">🎯</span>
            </button>
            
            <p className="text-gray-400 text-sm mt-6">
              Diagnóstico completamente gratuito • Sin compromiso • Resultados instantáneos
            </p>
          </div>

          {/* Indicador de scroll */}
          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            <div className="animate-bounce">
              <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3m0 11H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <p className="text-gray-500 text-xs mt-2">Desliza para comenzar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
