import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { BUSINESS_AREAS } from '../../types';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface BusinessRadarChartProps {
  progressScores?: Record<string, number>; // areaId -> percentage (0-100)
  onAreaSelect?: (areaId: string) => void;
}

export const BusinessRadarChart: React.FC<BusinessRadarChartProps> = ({
  progressScores = {},
  onAreaSelect
}) => {
  // Las 8 áreas estándar
  const labels = BUSINESS_AREAS.map((a) => a.name);
  
  const hasScores = Object.keys(progressScores).length > 0;
  const dataValues = BUSINESS_AREAS.map((area) => {
    if (progressScores[area.id] !== undefined) {
      return progressScores[area.id];
    }
    return 0;
  });

  // Calcular el área más débil para dar feedback táctico
  let lowestIndex = 0;
  let lowestVal = 101;
  dataValues.forEach((val, idx) => {
    if (val < lowestVal) {
      lowestVal = val;
      lowestIndex = idx;
    }
  });

  const weakestArea = BUSINESS_AREAS[lowestIndex];
  const overallAverage = hasScores
    ? Math.round(dataValues.reduce((a, b) => a + b, 0) / dataValues.length)
    : null;

  const data = {
    labels,
    datasets: [
      {
        label: 'Nivel de Madurez Operativa (%)',
        data: dataValues,
        backgroundColor: 'rgba(0, 195, 255, 0.25)',
        borderColor: '#00C3FF',
        borderWidth: 2.5,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: '#FFFFFF',
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#00C3FF',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.08)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)'
        },
        pointLabels: {
          color: '#9CA3AF',
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: 600 as const
          }
        },
        ticks: {
          display: false,
          min: 0,
          max: 100,
          stepSize: 20
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1A1A2E',
        titleColor: '#FFFFFF',
        bodyColor: '#00C3FF',
        borderColor: '#8B5CF6',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => ` Madurez: ${context.raw}%`
        }
      }
    }
  };

  return (
    <div className="bg-dark-secondary/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-electric-blue uppercase tracking-wider bg-electric-blue/10 px-2.5 py-1 rounded-full border border-electric-blue/20">
            Diagnóstico 360°
          </span>
          <h3 className="text-xl font-bold text-white mt-1">Radar de Madurez Empresarial</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-violet">
            {overallAverage === null ? 'Sin datos' : `${overallAverage}%`}
          </div>
          <div className="text-[11px] text-gray-400">Salud General</div>
        </div>
      </div>

      <div className="h-[280px] w-full my-2">
        <Radar data={data} options={options} />
      </div>

      {weakestArea && (
        <div className="mt-4 p-3.5 bg-dark-tertiary/70 rounded-xl border border-red-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{weakestArea.icon}</span>
            <div>
              <div className="text-xs text-red-400 font-semibold uppercase">Prioridad de Escalamiento</div>
              <div className="text-sm font-bold text-white">{weakestArea.name} ({lowestVal}%)</div>
            </div>
          </div>
          {onAreaSelect && (
            <button
              onClick={() => onAreaSelect(weakestArea.id)}
              className="text-xs font-bold bg-violet/20 hover:bg-violet/30 text-violet px-3 py-1.5 rounded-lg border border-violet/40 transition-colors"
            >
              Fortalecer →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessRadarChart;
