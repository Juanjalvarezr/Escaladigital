import React from 'react';

const WelcomeScreen: React.FC<{ onContinue: () => void; onSkip?: () => void }> = ({ onContinue, onSkip }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg relative overflow-hidden">
    {/* Fondo decorativo (Glow) */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet rounded-full mix-blend-screen filter blur-[128px] opacity-20"></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-blue rounded-full mix-blend-screen filter blur-[128px] opacity-20"></div>

    <div className="relative z-10 w-full max-w-lg p-10 bg-dark-secondary bg-opacity-60 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 text-center">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-violet mb-6 tracking-tight">
        Escala Digital
      </h1>
      <p className="text-lg text-gray-300 mb-10 leading-relaxed">
        Bienvenido a la plataforma de desarrollo empresarial. Diagnostica tu negocio, descubre tu ruta y escala al siguiente nivel con Inteligencia Artificial.
      </p>
      
      <div className="flex flex-col space-y-4 w-full">
        <button
          className="w-full px-6 py-4 font-semibold text-white bg-gradient-to-r from-electric-blue to-violet rounded-xl shadow-lg hover:opacity-90 transform hover:-translate-y-1 transition-all duration-200"
          onClick={onContinue}
        >
          Iniciar Diagnóstico IA
        </button>
        {onSkip && (
          <button
            className="w-full px-6 py-4 font-semibold text-gray-300 bg-dark-tertiary bg-opacity-50 border border-gray-700 rounded-xl hover:bg-gray-800 hover:text-white transition-all duration-200"
            onClick={onSkip}
          >
            Ir directo al Dashboard
          </button>
        )}
      </div>
    </div>
  </div>
);

export default WelcomeScreen;
