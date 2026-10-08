import type { ModuleProgress } from '../types';
import type { ProcessAcademyPlan } from '../types/processAcademy';

/**
 * A metric deliberately uses `null` when the source does not contain enough
 * evidence. Consumers can render `status` instead of turning an unknown value
 * into a misleading zero or percentage.
 */
export type MetricStatus = 'available' | 'no_data' | 'insufficient_data';
export type MetricUnit = 'count' | 'percentage';

export interface MetricValue {
  value: number | null;
  unit: MetricUnit;
  status: MetricStatus;
  numerator?: number;
  denominator?: number;
}

export interface LearningEventRecord {
  id?: string | null;
  user_id?: string | null;
  event_type: string;
  module_key?: string | null;
  lesson_key?: string | null;
  quiz_key?: string | null;
  event_properties?: Record<string, unknown> | null;
}

/**
 * Accepts both the app's camelCase `ModuleProgress` shape and the
 * snake_case shape returned by `user_progress` in Supabase.
 */
export interface ModuleProgressRecord {
  userId?: string | null;
  user_id?: string | null;
  moduleId?: string | null;
  module_id?: string | null;
  status?: ModuleProgress['status'] | null;
  completionPercentage?: number | null;
  completion_percentage?: number | null;
  lessonsCompleted?: readonly string[] | null;
  lessons_completed?: readonly string[] | null;
  lastAccessed?: Date | string | null;
  last_accessed?: Date | string | null;
}

export interface MetricsUser {
  id: string;
}

/**
 * This is intentionally narrower than the persisted Zustand state. XP and
 * streak defaults are not learning evidence, so they are not used here.
 * `activityCount` can be populated by an event-backed adapter when progress
 * rows are not available.
 */
export interface LearningStateSnapshot {
  userId: string;
  activityCount?: number;
  completedActionItems?: Readonly<Record<string, boolean>>;
  simulationScores?: Readonly<Record<string, number>>;
  flashcardRepetitions?: number;
}

export interface BusinessActionRecord {
  id?: string | null;
  status: 'planned' | 'in_progress' | 'done' | 'cancelled';
  owner_user_id?: string | null;
}

export interface LearningMetricsInput {
  users?: readonly MetricsUser[];
  moduleProgress?: readonly ModuleProgressRecord[];
  learningEvents?: readonly LearningEventRecord[];
  learningStates?: readonly LearningStateSnapshot[];
  businessActions?: readonly BusinessActionRecord[];
  processPlans?: readonly ProcessAcademyPlan[];
}

export interface ActivationMetrics {
  cohortSize: MetricValue;
  activatedLearners: MetricValue;
  activationRate: MetricValue;
}

export interface LearningMetrics {
  activeLearners: MetricValue;
  lessonsCompleted: MetricValue;
  modulesCompleted: MetricValue;
  averageModuleCompletion: MetricValue;
  quizPassRate: MetricValue;
}

export interface ApplicationMetrics {
  plannedActions: MetricValue;
  completedActions: MetricValue;
  applicationRate: MetricValue;
  learnersWithApplicationEvidence: MetricValue;
}

export interface LearningMetricsSnapshot {
  activation: ActivationMetrics;
  learning: LearningMetrics;
  application: ApplicationMetrics;
}

const ACTIVATION_EVENT_TYPES = new Set([
  'module_started',
  'lesson_started',
  'lesson_completed',
  'quiz_started',
  'quiz_attempted',
  'quiz_submitted',
  'quiz_passed',
  'module_completed'
]);

const LESSON_COMPLETION_EVENT_TYPES = new Set(['lesson_completed']);
const MODULE_COMPLETION_EVENT_TYPES = new Set(['module_completed']);
const QUIZ_ATTEMPT_EVENT_TYPES = new Set([
  'quiz_attempted',
  'quiz_submitted',
  'quiz_completed'
]);
const QUIZ_PASS_EVENT_TYPES = new Set(['quiz_passed']);
const APPLICATION_EVENT_TYPES = new Set([
  'action_started',
  'action_completed',
  'application_recorded',
  'practice_completed',
  'tool_applied'
]);

const noData = (unit: MetricUnit): MetricValue => ({
  value: null,
  unit,
  status: 'no_data'
});

const insufficientData = (unit: MetricUnit, numerator?: number): MetricValue => ({
  value: null,
  unit,
  status: 'insufficient_data',
  ...(numerator === undefined ? {} : { numerator })
});

const count = (value: number, hasData: boolean): MetricValue =>
  hasData
    ? { value, unit: 'count', status: 'available' }
    : noData('count');

const percentage = (numerator: number, denominator: number | null): MetricValue => {
  if (denominator === null) return insufficientData('percentage', numerator);
  if (denominator <= 0) return noData('percentage');

  return {
    value: Math.round((numerator / denominator) * 10000) / 100,
    unit: 'percentage',
    status: 'available',
    numerator,
    denominator
  };
};

const validUserId = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const eventUserId = (event: LearningEventRecord): string | null =>
  validUserId(event.user_id) ? event.user_id : null;

const eventKey = (
  event: LearningEventRecord,
  fallback: string,
  index: number
): string => event.id || fallback || `${event.event_type}:${index}`;

const latestProgressByModule = (
  rows: readonly ModuleProgress[]
): Map<string, ModuleProgress> => {
  const latest = new Map<string, ModuleProgress>();

  rows.forEach((row) => {
    if (!validUserId(row.userId) || !row.moduleId) return;
    const key = `${row.userId}:${row.moduleId}`;
    const previous = latest.get(key);
    if (!previous || row.lastAccessed.getTime() >= previous.lastAccessed.getTime()) {
      latest.set(key, row);
    }
  });

  return latest;
};

export const normalizeModuleProgress = (
  row: ModuleProgressRecord
): ModuleProgress | null => {
  const userId = row.userId || row.user_id;
  const moduleId = row.moduleId || row.module_id;
  const status = row.status;
  const lastAccessedValue = row.lastAccessed || row.last_accessed;
  const lastAccessed = lastAccessedValue ? new Date(lastAccessedValue) : null;

  if (
    !validUserId(userId) ||
    !moduleId ||
    !status ||
    !lastAccessed ||
    Number.isNaN(lastAccessed.getTime())
  ) {
    return null;
  }

  const completionPercentage =
    row.completionPercentage ?? row.completion_percentage ?? 0;
  const lessonsCompleted = row.lessonsCompleted || row.lessons_completed || [];

  return {
    userId,
    moduleId,
    status,
    completionPercentage,
    lessonsCompleted: Array.from(lessonsCompleted),
    lastAccessed
  };
};

const normalizedProgress = (
  rows: readonly ModuleProgressRecord[]
): ModuleProgress[] =>
  rows
    .map(normalizeModuleProgress)
    .filter((row): row is ModuleProgress => row !== null);

const actionRows = (input: LearningMetricsInput): readonly BusinessActionRecord[] => {
  if (input.businessActions !== undefined) return input.businessActions;
  if (!input.processPlans) return [];

  return input.processPlans.flatMap((plan) =>
    plan.processes.flatMap((process) =>
      process.actions.map((action) => ({
        id: action.id,
        status:
          action.status === 'done'
            ? 'done'
            : action.status === 'in_progress'
              ? 'in_progress'
              : 'planned'
      }))
    )
  );
};

const uniqueEventUsers = (
  events: readonly LearningEventRecord[],
  allowedTypes: ReadonlySet<string>
): Set<string> =>
  new Set(
    events
      .filter((event) => allowedTypes.has(event.event_type))
      .map(eventUserId)
      .filter(validUserId)
  );

/**
 * Aggregates the existing progress, learning-event and process-academy
 * records. It is pure and safe to use in a page, a selector, or a Supabase
 * adapter; it never performs I/O or changes persisted state.
 */
export const aggregateLearningMetrics = (
  input: LearningMetricsInput = {}
): LearningMetricsSnapshot => {
  const progressRows = input.moduleProgress || [];
  const events = input.learningEvents || [];
  const learningStates = input.learningStates || [];
  const normalizedRows = normalizedProgress(progressRows);
  const progress = latestProgressByModule(normalizedRows);
  const learningEvidenceUsers = new Set<string>();
  const hasLearningSource =
    normalizedRows.length > 0 || events.length > 0 || learningStates.length > 0;

  progress.forEach((row) => {
    if (
      row.status !== 'not_started' ||
      row.completionPercentage > 0 ||
      row.lessonsCompleted.length > 0
    ) {
      learningEvidenceUsers.add(row.userId);
    }
  });

  uniqueEventUsers(events, ACTIVATION_EVENT_TYPES).forEach((userId) =>
    learningEvidenceUsers.add(userId)
  );

  learningStates.forEach((state) => {
    const hasExplicitEvidence =
      (state.activityCount || 0) > 0 ||
      Object.values(state.completedActionItems || {}).some(Boolean) ||
      Object.keys(state.simulationScores || {}).length > 0 ||
      (state.flashcardRepetitions || 0) > 0;
    if (validUserId(state.userId) && hasExplicitEvidence) {
      learningEvidenceUsers.add(state.userId);
    }
  });

  const knownUsers = input.users
    ? new Set(input.users.map((user) => user.id).filter(validUserId))
    : null;
  const activatedLearners = knownUsers
    ? Array.from(learningEvidenceUsers).filter((userId) => knownUsers.has(userId)).length
    : learningEvidenceUsers.size;

  const lessonKeys = new Set<string>();
  progress.forEach((row) => {
    row.lessonsCompleted.forEach((lessonId) => {
      if (lessonId) lessonKeys.add(`${row.userId}:${lessonId}`);
    });
  });
  events.forEach((event, index) => {
    if (!LESSON_COMPLETION_EVENT_TYPES.has(event.event_type)) return;
    const userId = eventUserId(event);
    const lessonId = event.lesson_key || eventKey(event, event.lesson_key || '', index);
    if (userId && lessonId) lessonKeys.add(`${userId}:${lessonId}`);
  });

  const completedModuleKeys = new Set<string>();
  progress.forEach((row) => {
    if (row.status === 'completed') completedModuleKeys.add(`${row.userId}:${row.moduleId}`);
  });
  events.forEach((event, index) => {
    if (!MODULE_COMPLETION_EVENT_TYPES.has(event.event_type)) return;
    const userId = eventUserId(event);
    const moduleId = event.module_key || eventKey(event, event.module_key || '', index);
    if (userId && moduleId) completedModuleKeys.add(`${userId}:${moduleId}`);
  });

  const completionValues = Array.from(progress.values())
    .map((row) => row.completionPercentage)
    .filter((value) => Number.isFinite(value) && value >= 0 && value <= 100);
  const averageCompletion =
    completionValues.length > 0
      ? Math.round(
          (completionValues.reduce((total, value) => total + value, 0) /
            completionValues.length) *
            100
        ) / 100
      : null;

  const quizAttempts = new Set<string>();
  const quizPasses = new Set<string>();
  events.forEach((event, index) => {
    const userId = eventUserId(event);
    const quizId = event.quiz_key || eventKey(event, event.quiz_key || '', index);
    if (!userId || !quizId) return;
    const key = `${userId}:${quizId}`;
    if (QUIZ_ATTEMPT_EVENT_TYPES.has(event.event_type)) quizAttempts.add(key);
    if (
      QUIZ_PASS_EVENT_TYPES.has(event.event_type) ||
      (event.event_type === 'quiz_completed' &&
        event.event_properties?.passed === true)
    ) {
      quizPasses.add(key);
    }
  });

  const actions = actionRows(input);
  const activeActions = actions.filter((action) => action.status !== 'cancelled');
  const completedActions = activeActions.filter((action) => action.status === 'done');
  const hasActionRows = actions.length > 0;
  const actionEvidenceUsers = new Set<string>();
  activeActions.forEach((action) => {
    if (action.status === 'done' && validUserId(action.owner_user_id)) {
      actionEvidenceUsers.add(action.owner_user_id);
    }
  });
  events.forEach((event) => {
    if (!APPLICATION_EVENT_TYPES.has(event.event_type)) return;
    const userId = eventUserId(event);
    if (userId) actionEvidenceUsers.add(userId);
  });

  const cohortSize =
    input.users === undefined
      ? noData('count')
      : count(knownUsers?.size || 0, (knownUsers?.size || 0) > 0);
  const activationRate =
    input.users === undefined
      ? insufficientData('percentage', activatedLearners)
      : percentage(activatedLearners, knownUsers?.size || 0);

  return {
    activation: {
      cohortSize,
      activatedLearners: count(activatedLearners, hasLearningSource),
      activationRate
    },
    learning: {
      activeLearners: count(learningEvidenceUsers.size, hasLearningSource),
      lessonsCompleted: count(
        lessonKeys.size,
        normalizedRows.length > 0 || events.length > 0
      ),
      modulesCompleted: count(
        completedModuleKeys.size,
        normalizedRows.length > 0 || events.length > 0
      ),
      averageModuleCompletion:
        averageCompletion === null
          ? noData('percentage')
          : {
              value: averageCompletion,
              unit: 'percentage',
              status: 'available',
              denominator: completionValues.length
            },
      quizPassRate: percentage(quizPasses.size, quizAttempts.size || null)
    },
    application: {
      plannedActions: count(activeActions.length, hasActionRows),
      completedActions: count(completedActions.length, hasActionRows),
      applicationRate: percentage(
        completedActions.length,
        hasActionRows ? activeActions.length : null
      ),
      learnersWithApplicationEvidence: count(
        actionEvidenceUsers.size,
        events.some((event) => APPLICATION_EVENT_TYPES.has(event.event_type))
      )
    }
  };
};

export const metricHasValue = (metric: MetricValue): metric is MetricValue & {
  value: number;
} => metric.status === 'available' && metric.value !== null;
