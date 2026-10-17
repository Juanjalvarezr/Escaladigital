import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import { BUSINESS_AREAS } from '../types';
import { DiagnosticResult } from '../services/gemini';
import {
  actionStatusLabels,
  addAction,
  createDefaultPlan,
  loadRemotePlan,
  maturityLabels,
  processStatusLabels,
  readLocalPlan,
  saveRemotePlan,
  updateAction,
  updateProcess,
  writeLocalPlan
} from '../services/processAcademy';
import { BusinessProcess, PlanningHorizon, ProcessAcademyPlan } from '../types/processAcademy';
import { isSupabaseConfigured } from '../supabase';
import { getCompanyIdForUser, recordLearningEvent } from '../services/learningEvents';
import { readUserDiagnostic } from '../utils/userScopedStorage';

const ProcessAcademyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<ProcessAcademyPlan | null>(null);
  const [selectedArea, setSelectedArea] = useState('all');
  const [horizon, setHorizon] = useState<PlanningHorizon>(30);
  const [saveState, setSaveState] = useState<'saving' | 'saved' | 'local'>('local');
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const companyId = user?.user_metadata?.defaultCompanyId || user?.user_metadata?.default_company_id;

  useEffect(() => {
    let mounted = true;
    let localPlan: ProcessAcademyPlan | null = null;
    try {
      const parsedDiagnostic = readUserDiagnostic<DiagnosticResult>(user?.id);
      const storedPlan = readLocalPlan(companyId);
      localPlan = storedPlan || createDefaultPlan(parsedDiagnostic);
      if (!storedPlan) writeLocalPlan(localPlan, companyId);
      if (mounted) setPlan(localPlan);
    } catch (error) {
      console.warn('No se pudo inicializar la academia de procesos', error);
      if (mounted) setPlan(createDefaultPlan());
    }

    if (user && isSupabaseConfigured && companyId) {
      loadRemotePlan(companyId).then((remotePlan) => {
        if (!mounted || !remotePlan) return;
        const remoteUpdated = new Date(remotePlan.updatedAt).getTime();
        const localUpdated = localPlan ? new Date(localPlan.updatedAt).getTime() : 0;
        if (remoteUpdated >= localUpdated) {
          writeLocalPlan(remotePlan, companyId);
          setPlan(remotePlan);
        }
        setSaveState('saved');
      }).catch((error: Error) => {
        if (!mounted) return;
        setRemoteError('La tabla remota aún no está disponible; tus cambios se guardan en este dispositivo.');
        setSaveState('local');
        console.warn('No se pudo cargar la academia de procesos remota', error);
      });
    }
    return () => { mounted = false; };
  }, [companyId, user]);

  const persist = (nextPlan: ProcessAcademyPlan) => {
    setPlan(nextPlan);
    writeLocalPlan(nextPlan, companyId);
    setSaveState(user && isSupabaseConfigured && companyId ? 'saving' : 'local');
    if (user && isSupabaseConfigured && companyId) {
      saveRemotePlan(companyId, nextPlan)
        .then(() => { setSaveState('saved'); setRemoteError(null); })
        .catch((error: Error) => {
          setSaveState('local');
          setRemoteError('Guardado local activo. Configura la tabla indicada en el contrato para sincronizar.');
          console.warn('No se pudo guardar la academia de procesos remota', error);
        });
    }
  };

  const handleActionChange = (
    process: BusinessProcess,
    actionId: string,
    changes: Partial<Pick<BusinessProcess['actions'][number], 'title' | 'dueDate' | 'horizon' | 'status'>>
  ) => {
    if (!plan) return;
    const action = process.actions.find((item) => item.id === actionId);
    const nextPlan = updateAction(plan, process.id, actionId, changes);
    persist(nextPlan);

    if (action && action.status !== 'done' && changes.status === 'done' && user) {
      void recordLearningEvent({
        companyId: getCompanyIdForUser(user),
        userId: user.id,
        eventType: 'action_completed',
        moduleKey: process.id,
        eventProperties: {
          processId: process.id,
          actionId,
          actionTitle: action.title
        }
      });
    }
  };

  const visibleProcesses = useMemo(() => {
    if (!plan) return [];
    return plan.processes.filter((process) => selectedArea === 'all' || process.areaId === selectedArea);
  }, [plan, selectedArea]);

  const stats = useMemo(() => {
    const processes = plan?.processes || [];
    const actions = processes.flatMap((process) => process.actions);
    return {
      processes: processes.length,
      measured: processes.filter((process) => process.metric.trim()).length,
      completed: actions.filter((action) => action.status === 'done').length,
      totalActions: actions.length
    };
  }, [plan]);

  if (!plan) {
    return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-gray-300">Preparando academia de procesos...</div>;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-16">
      <header className="sticky top-0 z-20 bg-dark-secondary/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-400 hover:text-white mb-2">← Volver a la Torre de Control</button>
            <h1 className="text-2xl sm:text-3xl font-black">Academia de Procesos</h1>
            <p className="text-sm text-gray-400 mt-1">Convierte el diagnóstico en un sistema ejecutable de 30/60/90 días.</p>
          </div>
          <div className="text-right text-xs">
            <div className={saveState === 'saved' ? 'text-emerald-400' : 'text-amber-300'}>
              {saveState === 'saved' ? '✓ Sincronizado' : saveState === 'saving' ? 'Guardando…' : '✓ Guardado local'}
            </div>
            <div className="text-gray-500 mt-1">Última edición: {new Date(plan.updatedAt).toLocaleString('es-MX')}</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['Procesos', stats.processes, 'Pilares con foco operativo'],
            ['Con métrica', stats.measured, 'Procesos que puedes observar'],
            ['Acciones', stats.totalActions, 'Compromisos en el plan'],
            ['Completadas', stats.completed, 'Acciones cerradas']
          ].map(([label, value, detail]) => (
            <div key={label} className="bg-dark-secondary border border-gray-800 rounded-xl p-4">
              <div className="text-2xl font-black text-electric-blue">{value}</div>
              <div className="text-sm font-semibold text-white">{label}</div>
              <div className="text-xs text-gray-500 mt-1">{detail}</div>
            </div>
          ))}
        </section>

        {remoteError && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 px-4 py-3 text-sm">{remoteError}</div>}

        <section className="bg-dark-secondary border border-gray-800 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-lg">Horizonte de ejecución</h2>
              <p className="text-sm text-gray-400">Revisa las acciones que vencen en cada etapa.</p>
            </div>
            <div className="flex rounded-lg bg-dark-bg p-1 border border-gray-700">
              {[30, 60, 90].map((days) => (
                <button key={days} onClick={() => setHorizon(days as PlanningHorizon)} className={`px-4 py-2 rounded-md text-sm font-bold ${horizon === days ? 'bg-violet text-white' : 'text-gray-400 hover:text-white'}`}>
                  {days} días
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto mt-5 pb-1">
            <button onClick={() => setSelectedArea('all')} className={`shrink-0 px-3 py-2 rounded-lg text-sm ${selectedArea === 'all' ? 'bg-electric-blue text-white' : 'bg-dark-bg text-gray-400 border border-gray-700'}`}>Todas las áreas</button>
            {BUSINESS_AREAS.map((area) => (
              <button key={area.id} onClick={() => setSelectedArea(area.id)} className={`shrink-0 px-3 py-2 rounded-lg text-sm ${selectedArea === area.id ? 'bg-electric-blue text-white' : 'bg-dark-bg text-gray-400 border border-gray-700'}`}>
                {area.icon} {area.name}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          {visibleProcesses.map((process) => (
            <ProcessCard key={process.id} process={process} horizon={horizon} onChange={(changes) => persist(updateProcess(plan, process.id, changes))} onActionChange={(actionId, changes) => handleActionChange(process, actionId, changes)} onAddAction={() => persist(addAction(plan, process.id))} />
          ))}
        </section>
      </main>
    </div>
  );
};

interface ProcessCardProps {
  process: BusinessProcess;
  horizon: PlanningHorizon;
  onChange: (changes: Partial<Pick<BusinessProcess, 'name' | 'objective' | 'maturity' | 'status' | 'responsible' | 'metric'>>) => void;
  onActionChange: (actionId: string, changes: Partial<Pick<BusinessProcess['actions'][number], 'title' | 'dueDate' | 'horizon' | 'status'>>) => void;
  onAddAction: () => void;
}

const ProcessCard: React.FC<ProcessCardProps> = ({ process, horizon, onChange, onActionChange, onAddAction }) => {
  const area = BUSINESS_AREAS.find((item) => item.id === process.areaId);
  const actions = process.actions.filter((action) => action.horizon <= horizon);
  return (
    <article className="bg-dark-secondary border border-gray-800 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-gray-800">
        <div className="flex flex-wrap gap-3 items-start justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-2xl">{area?.icon}</span>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-electric-blue font-bold">{area?.name}</div>
              <input value={process.name} onChange={(event) => onChange({ name: event.target.value })} className="mt-1 w-full bg-transparent text-xl font-bold text-white border-b border-transparent focus:border-electric-blue focus:outline-none" aria-label={`Nombre del proceso de ${area?.name}`} />
              <input value={process.objective} onChange={(event) => onChange({ objective: event.target.value })} className="mt-2 w-full bg-transparent text-sm text-gray-400 border-b border-transparent focus:border-electric-blue focus:outline-none" aria-label={`Objetivo del proceso de ${area?.name}`} />
            </div>
          </div>
          <select value={process.status} onChange={(event) => onChange({ status: event.target.value as BusinessProcess['status'] })} className="bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
            {Object.entries(processStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          <label className="text-xs text-gray-400">Madurez
            <select value={process.maturity} onChange={(event) => onChange({ maturity: Number(event.target.value) as BusinessProcess['maturity'] })} className="mt-1 w-full bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
              {Object.entries(maturityLabels).map(([value, label]) => <option key={value} value={value}>{value} · {label}</option>)}
            </select>
          </label>
          <label className="text-xs text-gray-400">Responsable
            <input value={process.responsible} onChange={(event) => onChange({ responsible: event.target.value })} placeholder="Nombre o rol" className="mt-1 w-full bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600" />
          </label>
          <label className="text-xs text-gray-400">Métrica de éxito
            <input value={process.metric} onChange={(event) => onChange({ metric: event.target.value })} placeholder="Ej. tiempo de entrega" className="mt-1 w-full bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600" />
          </label>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <div><h3 className="font-bold">Acciones hasta {horizon} días</h3><p className="text-xs text-gray-500">Fecha, horizonte y estado del compromiso.</p></div>
          <button onClick={onAddAction} className="text-sm text-electric-blue hover:text-white">+ Añadir acción</button>
        </div>
        <div className="space-y-2">
          {actions.map((action) => (
            <div key={action.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 items-center bg-dark-bg rounded-lg p-3 border border-gray-800">
              <input value={action.title} onChange={(event) => onActionChange(action.id, { title: event.target.value })} className="bg-transparent text-sm text-white border-b border-transparent focus:border-electric-blue focus:outline-none" aria-label="Título de acción" />
              <input type="date" value={action.dueDate} onChange={(event) => onActionChange(action.id, { dueDate: event.target.value })} className="bg-dark-secondary border border-gray-700 rounded px-2 py-1 text-xs text-white" aria-label="Fecha de acción" />
              <select value={action.horizon} onChange={(event) => onActionChange(action.id, { horizon: Number(event.target.value) as PlanningHorizon })} className="bg-dark-secondary border border-gray-700 rounded px-2 py-1 text-xs text-white" aria-label="Horizonte de acción">
                {[30, 60, 90].map((days) => <option key={days} value={days}>{days} días</option>)}
              </select>
              <select value={action.status} onChange={(event) => onActionChange(action.id, { status: event.target.value as typeof action.status })} className="bg-dark-secondary border border-gray-700 rounded px-2 py-1 text-xs text-white" aria-label="Estado de acción">
                {Object.entries(actionStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          ))}
          {actions.length === 0 && <p className="text-sm text-gray-500">No hay acciones en este horizonte.</p>}
        </div>
      </div>
    </article>
  );
};

export default ProcessAcademyPage;
