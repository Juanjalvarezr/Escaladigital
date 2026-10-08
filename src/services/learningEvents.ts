import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export type LearningEventType =
  | 'diagnostic_completed'
  | 'quiz_completed'
  | 'lesson_completed'
  | 'action_completed';

export interface LearningEventInput {
  companyId?: string | null;
  userId?: string | null;
  eventType: LearningEventType;
  moduleKey?: string | null;
  lessonKey?: string | null;
  quizKey?: string | null;
  sessionId?: string | null;
  eventProperties?: Record<string, unknown>;
}

export interface LearningEventError {
  message: string;
  cause?: unknown;
  skipped: boolean;
}

export type LearningEventResult =
  | { ok: true; eventId?: string }
  | { ok: false; error: LearningEventError };

/**
 * The auth profile stores this value in metadata, while older sessions may
 * expose it directly on the user object. Keep the lookup tolerant so event
 * tracking never becomes a prerequisite for rendering learning content.
 */
export const getCompanyIdForUser = (user?: SupabaseUser | null): string | undefined => {
  if (!user) return undefined;

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const directUser = user as SupabaseUser & { default_company_id?: unknown };
  const companyId =
    metadata.defaultCompanyId ||
    metadata.default_company_id ||
    directUser.default_company_id;

  return typeof companyId === 'string' && companyId.trim() ? companyId : undefined;
};

const toError = (error: unknown, fallback: string): LearningEventError => ({
  message: error instanceof Error ? error.message : fallback,
  cause: error,
  skipped: false
});

const findPersistedCompanyId = async (userId?: string | null): Promise<string | undefined> => {
  if (!userId) return undefined;

  try {
    const { data } = await supabase
      .from('users')
      .select('default_company_id')
      .eq('id', userId)
      .maybeSingle();
    const companyId = data?.default_company_id;
    return typeof companyId === 'string' && companyId.trim() ? companyId : undefined;
  } catch (error) {
    console.warn('[learning-events] Could not resolve the user company.', error);
    return undefined;
  }
};

const RETRY_QUEUE_KEY = 'escala:learning-events-retry:v1';

const enqueueRetry = (input: LearningEventInput) => {
  try {
    const current = JSON.parse(window.localStorage.getItem(RETRY_QUEUE_KEY) || '[]') as LearningEventInput[];
    window.localStorage.setItem(RETRY_QUEUE_KEY, JSON.stringify([...current.slice(-49), input]));
  } catch (error) {
    console.warn('[learning-events] Could not queue event for retry.', error);
  }
};

export const flushLearningEventQueue = async (): Promise<void> => {
  try {
    const queued = JSON.parse(window.localStorage.getItem(RETRY_QUEUE_KEY) || '[]') as LearningEventInput[];
    if (queued.length === 0) return;
    window.localStorage.removeItem(RETRY_QUEUE_KEY);
    for (const input of queued) {
      const result = await recordLearningEvent(input, false);
      if (!result.ok) enqueueRetry(input);
    }
  } catch (error) {
    console.warn('[learning-events] Could not flush retry queue.', error);
  }
};

/**
 * Persist a learning event without making persistence part of the user flow.
 * Callers can deliberately fire-and-forget this function; failures are
 * returned for observability and never thrown to the UI.
 */
export const recordLearningEvent = async (
  input: LearningEventInput,
  shouldQueue = true
): Promise<LearningEventResult> => {
  const companyId = input.companyId?.trim() || await findPersistedCompanyId(input.userId);
  if (!companyId) {
    return {
      ok: false,
      error: {
        message: 'Learning event skipped: company_id is unavailable.',
        skipped: true
      }
    };
  }

  try {
    const { data, error } = await supabase
      .from('learning_events')
      .insert({
        company_id: companyId,
        user_id: input.userId || null,
        event_type: input.eventType,
        module_key: input.moduleKey || null,
        lesson_key: input.lessonKey || null,
        quiz_key: input.quizKey || null,
        session_id: input.sessionId || null,
        event_properties: input.eventProperties || {}
      })
      .select('id')
      .maybeSingle();

    if (error) {
      const result = { ok: false as const, error: toError(error, 'Could not persist learning event.') };
      if (shouldQueue) enqueueRetry(input);
      console.warn('[learning-events] Event was not persisted.', result.error.message);
      return result;
    }

    return { ok: true, eventId: data?.id };
  } catch (error) {
    const result = { ok: false as const, error: toError(error, 'Could not persist learning event.') };
    if (shouldQueue) enqueueRetry(input);
    console.warn('[learning-events] Event tracking failed safely.', result.error.message);
    return result;
  }
};
