import { AreaId } from './index';

export type ProcessMaturity = 1 | 2 | 3 | 4 | 5;
export type ProcessStatus = 'not_started' | 'in_progress' | 'stable' | 'blocked';
export type ActionStatus = 'pending' | 'in_progress' | 'done';
export type PlanningHorizon = 30 | 60 | 90;

export interface ProcessAction {
  id: string;
  title: string;
  dueDate: string;
  horizon: PlanningHorizon;
  status: ActionStatus;
}

export interface BusinessProcess {
  id: string;
  areaId: AreaId;
  name: string;
  objective: string;
  maturity: ProcessMaturity;
  status: ProcessStatus;
  responsible: string;
  metric: string;
  actions: ProcessAction[];
}

export interface ProcessAcademyPlan {
  version: 1;
  updatedAt: string;
  processes: BusinessProcess[];
}
