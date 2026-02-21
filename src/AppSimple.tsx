import React from 'react';

const AppSimple: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-dark-secondary rounded-2xl p-8 border border-violet/20 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🚀 <span className="text-violet">Escala Digital</span> - Modo Simple
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              Probando UI sin dependencias externas
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => alert('Botón 1 funciona')}
                className="w-full py-3 bg-violet text-white rounded-lg hover:bg-violet/90 transition-colors"
              >
                Probar Botón 1
              </button>
              
              <button
                onClick={() => alert('Botón 2 funciona')}
                className="w-full py-3 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 transition-colors"
              >
                Probar Botón 2
              </button>
              
              <button
                onClick={() => alert('Navegar al Dashboard')}
                className="w-full py-3 bg-gradient-to-r from-violet to-electric-blue text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Ir al Dashboard
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Si esto funciona, el problema está en Supabase o Gemini
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Versión de prueba sin backend
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSimple;
