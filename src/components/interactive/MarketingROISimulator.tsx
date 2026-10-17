import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';

/* ─────────────────────────────────────────────────────────────── */
/*  TYPES                                                           */
/* ─────────────────────────────────────────────────────────────── */
interface Channel {
  id: string;
  name: string;
  icon: string;
  cpm: number;        // Costo por mil impresiones
  ctr: number;        // Click-through rate base
  convRate: number;   // Tasa de conversión base
  color: string;
}

/* ─────────────────────────────────────────────────────────────── */
/*  DATA                                                            */
/* ─────────────────────────────────────────────────────────────── */
const CHANNELS: Channel[] = [
  { id: 'instagram', name: 'Instagram Ads', icon: '📸', cpm: 8, ctr: 0.012, convRate: 0.025, color: '#e1306c' },
  { id: 'google',    name: 'Google Ads',    icon: '🔍', cpm: 15, ctr: 0.05, convRate: 0.04,  color: '#4285f4' },
  { id: 'facebook',  name: 'Facebook Ads',  icon: '📘', cpm: 6,  ctr: 0.009, convRate: 0.02, color: '#1877f2' },
  { id: 'tiktok',   name: 'TikTok Ads',    icon: '🎵', cpm: 4,  ctr: 0.02,  convRate: 0.015, color: '#010101' },
  { id: 'email',    name: 'Email Mktg',    icon: '📧', cpm: 1,  ctr: 0.22,  convRate: 0.03,  color: '#10b981' },
];

/* ─────────────────────────────────────────────────────────────── */
/*  COMPONENT                                                       */
/* ─────────────────────────────────────────────────────────────── */
interface MarketingROISimulatorProps {
  onComplete?: () => void;
}

export const MarketingROISimulator: React.FC<MarketingROISimulatorProps> = ({ onComplete }) => {
  const { addXp } = useLearningStore();

  const [budget, setBudget] = useState(500);
  const [ticket, setTicket] = useState(80);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['instagram', 'email']);
  const [completed, setCompleted] = useState(false);

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Calcular resultados por canal
  const results = CHANNELS.filter(c => selectedChannels.includes(c.id)).map(c => {
    const budgetShare = budget / selectedChannels.length;
    const impressions = (budgetShare / c.cpm) * 1000;
    const clicks = impressions * c.ctr;
    const leads = clicks * 0.15;
    const sales = leads * c.convRate;
    const revenue = sales * ticket;
    const roi = ((revenue - budgetShare) / budgetShare) * 100;
    return { ...c, budgetShare, impressions, clicks, leads, sales, revenue, roi };
  });

  const totalRevenue = results.reduce((s, r) => s + r.revenue, 0);
  const totalROI = ((totalRevenue - budget) / budget) * 100;
  const bestChannel = results.reduce((best, r) => (!best || r.roi > best.roi ? r : best), results[0]);

  const handleComplete = () => {
    setCompleted(true);
    addXp(70, 'Simulador de ROI de Marketing dominado');
    setTimeout(() => onComplete?.(), 1800);
  };

  return (
    <div className="bg-dark-secondary border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-pink-500/10 to-violet/10 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">📊</span>
          <div>
            <span className="text-xs font-black text-pink-400 uppercase tracking-widest bg-pink-400/10 px-2 py-0.5 rounded-full border border-pink-400/20">
              Simulador de Marketing
            </span>
            <h3 className="text-xl font-black text-white mt-1">Calcula el ROI de tus Canales Digitales</h3>
            <p className="text-xs text-gray-400 mt-0.5">Ajusta tu presupuesto, ticket promedio y canales para ver resultados proyectados</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-dark-tertiary/50 border border-gray-700 rounded-xl p-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Presupuesto Mensual (USD)
            </label>
            <div className="flex items-center space-x-3 mt-3">
              <input
                type="range"
                min={100} max={5000} step={50}
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="flex-1 accent-pink-500"
              />
              <span className="text-white font-black text-lg w-20 text-right">${budget.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-dark-tertiary/50 border border-gray-700 rounded-xl p-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Ticket Promedio de Venta (USD)
            </label>
            <div className="flex items-center space-x-3 mt-3">
              <input
                type="range"
                min={10} max={2000} step={10}
                value={ticket}
                onChange={e => setTicket(Number(e.target.value))}
                className="flex-1 accent-violet"
              />
              <span className="text-white font-black text-lg w-20 text-right">${ticket}</span>
            </div>
          </div>
        </div>

        {/* Channel Selector */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Canales que vas a usar</p>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map(c => (
              <button
                key={c.id}
                onClick={() => toggleChannel(c.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedChannels.includes(c.id)
                    ? 'text-white border-transparent'
                    : 'text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200'
                }`}
                style={selectedChannels.includes(c.id) ? { background: `${c.color}30`, borderColor: `${c.color}60`, color: c.color } : {}}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-tertiary border border-gray-700 rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white">${totalRevenue.toFixed(0)}</div>
                <div className="text-xs text-gray-400 mt-1">Revenue Proyectado</div>
              </div>
              <div className={`border rounded-xl p-4 text-center ${totalROI >= 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className={`text-2xl font-black ${totalROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400 mt-1">ROI Estimado</div>
              </div>
              <div className="bg-dark-tertiary border border-gray-700 rounded-xl p-4 text-center">
                <div className="text-xl font-black text-white flex items-center justify-center space-x-1">
                  <span>{bestChannel?.icon}</span>
                  <span className="text-sm">{bestChannel?.name.split(' ')[0]}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">Mejor Canal</div>
              </div>
            </div>

            {/* Channel Breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Desglose por canal</p>
              {results.map(r => (
                <div key={r.id} className="bg-dark-tertiary/50 border border-gray-700/60 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span>{r.icon}</span>
                      <span className="text-sm font-bold text-white">{r.name}</span>
                      <span className="text-xs text-gray-500">(${r.budgetShare.toFixed(0)} presupuesto)</span>
                    </div>
                    <span className={`text-sm font-black ${r.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {r.roi >= 0 ? '+' : ''}{r.roi.toFixed(0)}% ROI
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-400">
                    <div><span className="text-white font-semibold">{r.impressions.toFixed(0)}</span> impresiones</div>
                    <div><span className="text-white font-semibold">{r.leads.toFixed(1)}</span> leads</div>
                    <div><span className="text-white font-semibold">{r.sales.toFixed(1)}</span> ventas</div>
                    <div><span className="text-emerald-400 font-semibold">${r.revenue.toFixed(0)}</span> revenue</div>
                  </div>
                  {/* ROI bar */}
                  <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(Math.max(r.roi, 0), 200) / 2}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: r.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Insight */}
            <div className="p-4 bg-violet/10 border border-violet/20 rounded-xl">
              <p className="text-sm text-gray-300">
                <span className="text-violet font-bold">💡 Insight: </span>
                {totalROI >= 100
                  ? `¡Excelente combinación! Con ${selectedChannels.length} canal(es) y $${budget} de presupuesto, proyectas duplicar tu inversión.`
                  : totalROI >= 0
                  ? `Tu mezcla genera ROI positivo. Considera aumentar el presupuesto en ${bestChannel?.name} que tiene el mejor rendimiento.`
                  : `Con este ticket promedio y presupuesto el ROI es negativo. Intenta subir el ticket o enfocarte en ${bestChannel?.name}.`
                }
              </p>
            </div>
          </div>
        )}

        {/* Complete button */}
        {!completed ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleComplete}
            disabled={results.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-violet text-white font-black rounded-xl text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
          >
            <span>He analizado mi mix de marketing (+70 XP)</span>
            <span>🎯</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center"
          >
            <p className="text-emerald-400 font-bold">¡Simulador dominado! +70 XP 🏆</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MarketingROISimulator;
