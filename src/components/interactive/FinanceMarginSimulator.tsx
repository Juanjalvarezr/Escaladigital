import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';

interface FinanceMarginSimulatorProps {
  onCompleted?: () => void;
}

export const FinanceMarginSimulator: React.FC<FinanceMarginSimulatorProps> = ({ onCompleted }) => {
  const { saveSimulationScore } = useLearningStore();

  const [unitPrice, setUnitPrice] = useState<number>(50);
  const [unitCost, setUnitCost] = useState<number>(20);
  const [fixedCosts, setFixedCosts] = useState<number>(1500);
  const [volume, setVolume] = useState<number>(100);
  const [saved, setSaved] = useState(false);

  // Cálculos dinámicos
  const marginPerUnit = unitPrice - unitCost;
  const marginPercentage = unitPrice > 0 ? Math.round((marginPerUnit / unitPrice) * 100) : 0;
  
  // Punto de equilibrio en unidades
  const breakEvenUnits = marginPerUnit > 0 ? Math.ceil(fixedCosts / marginPerUnit) : 0;
  
  // Ingresos totales y Utilidad neta
  const totalRevenue = unitPrice * volume;
  const totalVariableCosts = unitCost * volume;
  const netProfit = totalRevenue - totalVariableCosts - fixedCosts;
  const isProfitable = netProfit > 0;

  // Escenario +10% en precio
  const optimizedPrice = Math.round(unitPrice * 1.1);
  const optimizedNetProfit = (optimizedPrice * volume) - totalVariableCosts - fixedCosts;
  const profitIncrease = optimizedNetProfit - netProfit;

  const handleSaveSimulation = () => {
    saveSimulationScore('finance-margin-simulator', 60);
    setSaved(true);
    if (onCompleted) onCompleted();
  };

  return (
    <div className="bg-dark-secondary border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🧮</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
              Laboratorio Financiero Interactivo
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">Simulador de Márgenes y Punto de Equilibrio</h3>
        </div>
        <div className="text-xs text-gray-400 bg-dark-tertiary px-3 py-1.5 rounded-lg border border-gray-700">
          Aprende ajustando variables en tiempo real
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controles interactivos (Sliders) */}
        <div className="space-y-5 bg-dark-tertiary/40 p-5 rounded-xl border border-gray-800">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300 font-medium">Precio de Venta Unitario</span>
              <span className="text-emerald-400 font-bold text-base">${unitPrice} USD</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300 font-medium">Costo Variable por Unidad (Materia prima, envío, etc.)</span>
              <span className="text-red-400 font-bold text-base">${unitCost} USD</span>
            </div>
            <input
              type="range"
              min="5"
              max={Math.max(10, unitPrice - 5)}
              step="5"
              value={unitCost}
              onChange={(e) => setUnitCost(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300 font-medium">Costos Fijos Mensuales (Nómina, arriendo, software)</span>
              <span className="text-amber-400 font-bold text-base">${fixedCosts} USD</span>
            </div>
            <input
              type="range"
              min="200"
              max="10000"
              step="100"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300 font-medium">Unidades Vendidas al Mes</span>
              <span className="text-electric-blue font-bold text-base">{volume} unidades</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-electric-blue"
            />
          </div>
        </div>

        {/* Panel de Resultados en Tiempo Real */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-tertiary p-4 rounded-xl border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Margen Bruto Unitario</div>
              <div className="text-2xl font-bold text-white">${marginPerUnit}</div>
              <div className="text-xs text-emerald-400 font-semibold">{marginPercentage}% del precio</div>
            </div>

            <div className="bg-dark-tertiary p-4 rounded-xl border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">Punto de Equilibrio</div>
              <div className="text-2xl font-bold text-amber-400">{breakEvenUnits} <span className="text-sm font-normal text-gray-300">uds</span></div>
              <div className="text-xs text-gray-400">
                {volume >= breakEvenUnits ? '✅ Superado este mes' : '⚠️ Faltan ' + (breakEvenUnits - volume) + ' ventas'}
              </div>
            </div>
          </div>

          {/* Resultado Neto */}
          <div className={`p-5 rounded-xl border transition-all ${
            isProfitable 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-300">Utilidad Neta Mensual Estimada</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isProfitable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isProfitable ? 'Rentable' : 'Pérdida'}
              </span>
            </div>
            <div className={`text-3xl font-black ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
              {netProfit >= 0 ? `+$${netProfit.toLocaleString()}` : `-$${Math.abs(netProfit).toLocaleString()}`} USD
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Ingresos: ${totalRevenue.toLocaleString()} | Costos Totales: ${(totalVariableCosts + fixedCosts).toLocaleString()}
            </div>
          </div>

          {/* Insight Estratégico de Escala */}
          <div className="bg-violet/10 border border-violet/20 p-4 rounded-xl text-xs text-gray-300">
            <div className="font-bold text-violet mb-1 flex items-center">
              <span className="mr-1.5">💡</span> Insight de Escalamiento:
            </div>
            Si aumentas tu precio solo un <strong className="text-white">10% (${optimizedPrice} USD)</strong> sin perder clientes, tu ganancia neta aumentaría en <strong className="text-emerald-400">+${profitIncrease.toLocaleString()} USD/mes</strong> (+{Math.abs(Math.round((profitIncrease / Math.max(1, Math.abs(netProfit))) * 100))}%).
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveSimulation}
            disabled={saved}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              saved
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-emerald-500 to-electric-blue text-white shadow-lg hover:shadow-emerald-500/25'
            }`}
          >
            {saved ? '✓ Simulación Registrada (+60 XP)' : 'Guardar Simulación en mi Estrategia (+60 XP)'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FinanceMarginSimulator;
