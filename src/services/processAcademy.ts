import { supabase } from '../supabase';
import { BUSINESS_AREAS } from '../types';
import { DiagnosticResult } from './gemini';
import {
  ActionStatus,
  BusinessProcess,
  ProcessAcademyPlan,
  ProcessAction,
  ProcessMaturity,
  ProcessStatus
} from '../types/processAcademy';

export const PROCESS_ACADEMY_STORAGE_KEY = 'escala:processAcademy:v1';
const storageKey = (companyId?: string) => companyId
  ? `${PROCESS_ACADEMY_STORAGE_KEY}:${companyId}`
  : PROCESS_ACADEMY_STORAGE_KEY;

const defaultActions = (areaId: string, areaName: string): ProcessAction[] => {
  const today = new Date();
  const dateIn = (days: number) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  return [
    { id: `${areaId}-action-1`, title: `Documentar el proceso de ${areaName.toLowerCase()}`, dueDate: dateIn(30), horizon: 30, status: 'pending' },
    { id: `${areaId}-action-2`, title: `Revisar el resultado y ajustar el proceso`, dueDate: dateIn(60), horizon: 60, status: 'pending' },
    { id: `${areaId}-action-3`, title: `Estandarizar y delegar la operación`, dueDate: dateIn(90), horizon: 90, status: 'pending' }
  ];
};

export const createDefaultPlan = (diagnostic?: DiagnosticResult | null): ProcessAcademyPlan => {
  const roadmap = diagnostic?.scalabilityRoadmap || [];
  const processes: BusinessProcess[] = BUSINESS_AREAS.map((area) => {
    const recommendation = roadmap.find((item) => item.moduleId?.startsWith(`${area.id}-`));
    return {
      id: `process-${area.id}`,
      areaId: area.id,
      name: recommendation?.phase || `Proceso clave de ${area.name}`,
      objective: recommendation?.description || area.description,
      maturity: 1,
      status: 'not_started',
      responsible: '',
      metric: '',
      actions: defaultActions(area.id, area.name)
    };
  });

  return { version: 1, updatedAt: new Date().toISOString(), processes };
};

export const readLocalPlan = (companyId?: string): ProcessAcademyPlan | null => {
  try {
    const stored = window.localStorage.getItem(storageKey(companyId));
    if (!stored) return null;
    const parsed = JSON.parse(stored) as ProcessAcademyPlan;
    if (parsed.version !== 1 || !Array.isArray(parsed.processes)) return null;
    return parsed;
  } catch (error) {
    console.warn('No se pudo leer la academia de procesos local', error);
    return null;
  }
};

export const writeLocalPlan = (plan: ProcessAcademyPlan, companyId?: string): void => {
  window.localStorage.setItem(storageKey(companyId), JSON.stringify(plan));
};

export const loadRemotePlan = async (companyId: string): Promise<ProcessAcademyPlan | null> => {
  const { data, error } = await supabase
    .from('process_academy_plans')
    .select('plan, updated_at')
    .eq('company_id', companyId)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.code === '42P01') return null;
    throw error;
  }

  if (!data?.plan || data.plan.version !== 1 || !Array.isArray(data.plan.processes)) return null;
  return { ...data.plan, updatedAt: data.updated_at || data.plan.updatedAt };
};

export const saveRemotePlan = async (companyId: string, plan: ProcessAcademyPlan): Promise<void> => {
  const { error } = await supabase
    .from('process_academy_plans')
    .upsert({ company_id: companyId, plan, updated_at: plan.updatedAt }, { onConflict: 'company_id' });
  if (error) throw error;
};

export const updateProcess = (
  plan: ProcessAcademyPlan,
  processId: string,
  changes: Partial<Pick<BusinessProcess, 'name' | 'objective' | 'maturity' | 'status' | 'responsible' | 'metric'>>
): ProcessAcademyPlan => ({
  ...plan,
  updatedAt: new Date().toISOString(),
  processes: plan.processes.map((process) => process.id === processId ? { ...process, ...changes } : process)
});

export const updateAction = (
  plan: ProcessAcademyPlan,
  processId: string,
  actionId: string,
  changes: Partial<Pick<ProcessAction, 'title' | 'dueDate' | 'horizon' | 'status'>>
): ProcessAcademyPlan => ({
  ...plan,
  updatedAt: new Date().toISOString(),
  processes: plan.processes.map((process) => process.id !== processId ? process : {
    ...process,
    actions: process.actions.map((action) => action.id === actionId ? { ...action, ...changes } : action)
  })
});

export const addAction = (plan: ProcessAcademyPlan, processId: string): ProcessAcademyPlan => {
  const newAction: ProcessAction = {
    id: `${processId}-action-${Date.now()}`,
    title: 'Nueva acción',
    dueDate: new Date().toISOString().slice(0, 10),
    horizon: 30,
    status: 'pending'
  };
  return {
    ...plan,
    updatedAt: new Date().toISOString(),
    processes: plan.processes.map((process) => process.id === processId
      ? { ...process, actions: [...process.actions, newAction] }
      : process)
  };
};

export const maturityLabels: Record<ProcessMaturity, string> = {
  1: 'Inicial',
  2: 'Repetible',
  3: 'Documentado',
  4: 'Medido',
  5: 'Optimizado'
};

export const processStatusLabels: Record<ProcessStatus, string> = {
  not_started: 'Sin iniciar',
  in_progress: 'En curso',
  stable: 'Estable',
  blocked: 'Bloqueado'
};

export const actionStatusLabels: Record<ActionStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Completada'
};
