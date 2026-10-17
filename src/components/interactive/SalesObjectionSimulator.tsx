import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';

interface Scenario {
  id: string;
  clientName: string;
  clientRole: string;
  avatar: string;
  objection: string;
  context: string;
  options: {
    text: string;
    type: 'poor' | 'mediocre' | 'optimal';
    feedback: string;
    points: number;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'sc-1',
    clientName: 'Carlos Gómez',
    clientRole: 'Dueño de Restaurante Local',
    avatar: '👨‍💼',
    objection: '"La verdad el servicio me interesa, pero se me hace muy caro comparado con lo que cobran otros."',
    context: 'Carlos necesita aumentar sus ventas de fin de semana pero tiene miedo de arriesgar presupuesto.',
    options: [
      {
        text: 'Si el problema es el precio, le puedo dar un 20% de descuento si firma hoy mismo.',
        type: 'poor',
        feedback: '❌ Descontar de inmediato devalúa tu trabajo, demuestra desesperación y reduce tu margen sin defender tu valor.',
        points: 10
      },
      {
        text: 'Entiendo Carlos, pero los otros ofrecen cosas de mala calidad y nosotros somos profesionales certificados.',
        type: 'mediocre',
        feedback: '⚠️ Atacar a la competencia te hace sonar defensivo y no le explica a Carlos qué beneficio tangible ganará él.',
        points: 25
      },
      {
        text: 'Te entiendo totalmente Carlos. Cuando dices caro, ¿te refieres al desembolso inicial o a la duda de si generará el retorno suficiente para pagarse solo?',
        type: 'optimal',
        feedback: '✅ ¡Excelente respuesta consultiva! Aisla la objeción real, valida su preocupación y cambia el enfoque de "costo" a "retorno de inversión".',
        points: 50
      }
    ]
  },
  {
    id: 'sc-2',
    clientName: 'Mariana Reyes',
    clientRole: 'Directora de Academia de Idiomas',
    avatar: '👩‍🏫',
    objection: '"Suena muy bien, pero déjame pensarlo y yo te aviso la próxima semana."',
    context: 'Mariana está interesada pero siente incertidumbre y prefiere posponer la decisión para evitar presión.',
    options: [
      {
        text: 'Claro que sí Mariana, no hay problema. Tómate todo el tiempo del mundo y me avisas cuando quieras.',
        type: 'poor',
        feedback: '❌ El "déjame pensarlo" casi siempre es una salida educada. Si no agendas una fecha concreta, el 85% de los prospectos se enfrían.',
        points: 10
      },
      {
        text: 'Totalmente comprensible, Mariana. Para que tengas toda la información al evaluarlo, ¿hay alguna duda específica sobre la implementación o los tiempos que podamos aclarar ahora?',
        type: 'optimal',
        feedback: '✅ ¡Brillante! Descubres si hay dudas ocultas sin ser agresivo y das espacio para resolver la objeción de raíz.',
        points: 50
      },
      {
        text: 'Solo te aviso que esta promoción vence hoy a las 6:00 pm, si no compras ahora el precio sube.',
        type: 'mediocre',
        feedback: '⚠️ Crear urgencia falsa genera desconfianza si no hay una razón legítima demostrada.',
        points: 20
      }
    ]
  },
  {
    id: 'sc-3',
    clientName: 'David Paredes',
    clientRole: 'Gerente de Distribuidora',
    avatar: '👨‍💻',
    objection: '"Ya tenemos un proveedor que nos hace eso y llevamos 3 años con ellos."',
    context: 'David tiene lealtad y comodidad con su proveedor actual, aunque no está 100% satisfecho con los tiempos.',
    options: [
      {
        text: 'Nosotros somos mucho mejores que ellos, pruébenos y verá que no se arrepiente.',
        type: 'poor',
        feedback: '❌ Pedirle que rompa una relación de 3 años sin evidencia previa genera resistencia natural.',
        points: 10
      },
      {
        text: 'Excelente David, tener un proveedor confiable es vital. No te pido que cambies de proveedor hoy; ¿te parece si hacemos una prueba pequeña en un solo pedido para que tengas una opción de respaldo si ellos fallan?',
        type: 'optimal',
        feedback: '✅ ¡Estrategia magistral del Caballo de Troya! Entras como "plan de respaldo" sin fricción y dejas que tus resultados te ganen el cliente.',
        points: 50
      },
      {
        text: '¿Cuánto le pagan a ellos? Le igualo el precio o se lo dejo más barato.',
        type: 'poor',
        feedback: '❌ Competir por precio atrae a los clientes más desleales y destruye la rentabilidad de tu negocio.',
        points: 15
      }
    ]
  }
];

export const SalesObjectionSimulator: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { saveSimulationScore } = useLearningStore();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const scenario = SCENARIOS[currentIdx];

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const chosen = scenario.options[index];
    setTotalScore((prev) => prev + chosen.points);
  };

  const handleNext = () => {
    if (currentIdx < SCENARIOS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      saveSimulationScore('sales-objection-simulator', Math.round((totalScore / 150) * 100));
      if (onComplete) onComplete();
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setTotalScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((totalScore / 150) * 100);
    const passed = percentage >= 70;

    return (
      <div className="bg-dark-secondary border border-gray-800 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-2xl">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-violet to-electric-blue flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          {passed ? '🏆' : '📚'}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">
          {passed ? '¡Maestría en Objeciones Demostrada!' : 'Buen Intento de Negociación'}
        </h3>
        <p className="text-gray-300 text-sm mb-6">
          Puntaje de Cierre: <strong className="text-electric-blue text-xl">{percentage}%</strong> ({totalScore}/150 pts)
        </p>

        <div className="bg-dark-tertiary p-4 rounded-xl border border-gray-700 text-left text-xs text-gray-300 space-y-2 mb-6">
          <div className="font-bold text-white text-sm">Lecciones Clave para Ventas Reales:</div>
          <div>• Nunca bajes precio de inmediato; primero descubre la raíz de la duda.</div>
          <div>• El "déjame pensarlo" se resuelve preguntando qué detalle falta aclarar.</div>
          <div>• Si ya tienen proveedor, entra como "plan de respaldo" con una prueba pequeña.</div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3 bg-gradient-to-r from-electric-blue to-violet text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm"
        >
          Repetir Simulador con Nuevos Enfoques
        </button>
      </div>
    );
  }

  return (
    <div className="bg-dark-secondary border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🎯</span>
          <span className="text-xs font-bold text-violet uppercase tracking-wider bg-violet/10 px-2.5 py-0.5 rounded-full border border-violet/20">
            Simulador de Objeciones en Vivo
          </span>
        </div>
        <div className="text-xs text-gray-400 font-medium">
          Caso {currentIdx + 1} de {SCENARIOS.length}
        </div>
      </div>

      {/* Client Chat Bubble */}
      <div className="bg-dark-tertiary/70 border border-gray-700/80 rounded-2xl p-5 mb-6 relative">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-dark-bg border border-gray-600 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
            {scenario.avatar}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-sm">{scenario.clientName}</span>
              <span className="text-[11px] text-gray-400">{scenario.clientRole}</span>
            </div>
            <p className="text-gray-200 text-sm font-medium leading-relaxed italic">
              {scenario.objection}
            </p>
            <div className="text-[11px] text-gray-400 mt-2">
              Contexto: {scenario.context}
            </div>
          </div>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        ¿Cómo responderías estratégicamente?
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {scenario.options.map((opt, i) => {
          const isSelected = selectedOption === i;
          let borderStyle = 'border-gray-700 hover:border-gray-500 bg-dark-tertiary/40';
          
          if (selectedOption !== null) {
            if (opt.type === 'optimal') {
              borderStyle = 'border-emerald-500/80 bg-emerald-500/10 text-emerald-200';
            } else if (isSelected) {
              borderStyle = 'border-red-500/80 bg-red-500/10 text-red-200';
            } else {
              borderStyle = 'opacity-40 border-gray-800 bg-dark-tertiary/20';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium leading-snug flex items-start space-x-3 ${borderStyle}`}
            >
              <span className="w-6 h-6 rounded-full bg-dark-bg border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 mt-0.5">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-gray-200">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Immediate Feedback Box */}
      {selectedOption !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-dark-bg border border-gray-700 mb-6"
        >
          <div className="text-xs font-bold uppercase tracking-wider text-electric-blue mb-1">
            Análisis de Retroalimentación:
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {scenario.options[selectedOption].feedback}
          </p>

          <button
            onClick={handleNext}
            className="mt-4 w-full py-2.5 bg-violet hover:bg-violet/90 text-white font-bold text-xs rounded-lg transition-colors"
          >
            {currentIdx < SCENARIOS.length - 1 ? 'Siguiente Caso de Venta →' : 'Ver Resultados del Simulador →'}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SalesObjectionSimulator;
