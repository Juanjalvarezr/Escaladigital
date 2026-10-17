import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BUSINESS_AREAS, MODULE_CATALOG, AreaId } from '../types';
import { BusinessRadarChart } from '../components/interactive/BusinessRadarChart';

const DEMO_PROGRESS: Record<AreaId, number> = {
  management: 42,
  sales: 28,
  marketing: 18,
  operations: 35,
  finance: 12,
  technology: 24,
  talent: 8,
  customer: 31
};

const PublicDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState<AreaId>('management');
  const area = BUSINESS_AREAS.find((item) => item.id === selectedArea) || BUSINESS_AREAS[0];
  const modules = MODULE_CATALOG[selectedArea];

  return (
    <div className="min-h-screen overflow-x-hidden bg-dark-bg text-white pb-16">
      <header className="sticky top-0 z-20 border-b border-gray-800 bg-dark-secondary/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Modo demostración</p>
            <h1 className="text-xl font-black sm:text-2xl">Escala Digital</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:border-violet hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Volver al inicio
            </button>
            <button
              type="button"
              onClick={() => navigate('/diagnostic')}
              className="rounded-lg bg-violet px-3 py-2 text-sm font-semibold text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Probar diagnóstico
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
          <h2 className="text-xl font-bold">Explora una cuenta de ejemplo</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-100/80">
            Estos avances, gráficos y procesos son datos ficticios para conocer la experiencia.
            No se guardan en Supabase ni representan el progreso de una cuenta real.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <BusinessRadarChart progressScores={DEMO_PROGRESS} onAreaSelect={(areaId) => setSelectedArea(areaId as AreaId)} />
          </div>
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-2xl border border-gray-800 bg-dark-secondary p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-electric-blue">Ruta de ejemplo</p>
              <h2 className="mt-2 text-2xl font-black">Ordena tu crecimiento antes de acelerarlo</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                La plataforma combina diagnóstico, aprendizaje y acciones concretas para ayudarte a decidir qué hacer primero.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['12', 'Lecciones'],
                ['3', 'Quizzes'],
                ['30/60/90', 'Días de plan']
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-gray-800 bg-dark-secondary p-4 text-center">
                  <div className="text-lg font-black text-violet">{value}</div>
                  <div className="mt-1 text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Pilares del negocio</h2>
            <p className="mt-1 text-sm text-gray-400">Selecciona un área para ver cómo se organiza el aprendizaje.</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {BUSINESS_AREAS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedArea(item.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  selectedArea === item.id ? 'bg-electric-blue text-white' : 'border border-gray-700 bg-dark-secondary text-gray-300 hover:text-white'
                }`}
              >
                {item.icon} {item.name}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-gray-800 bg-dark-secondary p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-2xl">{area.icon}</p>
                <h3 className="mt-1 text-xl font-bold">{area.name}</h3>
                <p className="mt-1 text-sm text-gray-400">{area.description}</p>
              </div>
              <span className="rounded-full border border-electric-blue/30 bg-electric-blue/10 px-3 py-1 text-sm font-bold text-electric-blue">
                {DEMO_PROGRESS[selectedArea]}% de ejemplo
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {modules.map((module) => (
                <div key={module.id} className="rounded-xl border border-gray-700 bg-dark-tertiary p-4">
                  <h4 className="font-semibold">{module.name}</h4>
                  <p className="mt-2 text-sm text-gray-400">{module.description}</p>
                  <span className="mt-4 inline-block text-xs font-semibold uppercase text-gray-500">{module.difficulty}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PublicDemoPage;
