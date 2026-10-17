-- Hardening for additive learning-event instrumentation.
-- Existing event columns and rows remain unchanged.

CREATE INDEX IF NOT EXISTS idx_learning_events_type_occurred
  ON public.learning_events(event_type, occurred_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'learning_events_event_type_not_blank'
      AND conrelid = 'public.learning_events'::regclass
  ) THEN
    ALTER TABLE public.learning_events
      ADD CONSTRAINT learning_events_event_type_not_blank
      CHECK (length(btrim(event_type)) > 0) NOT VALID;
  END IF;
END
$$;

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

-- Diagnostic and action events do not always have a content key. Replace the
-- original content-only check so the events emitted by the app are persistable.
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    WHERE c.conrelid = 'public.learning_events'::regclass
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%module_key IS NOT NULL%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.learning_events DROP CONSTRAINT %I',
      constraint_name
    );
  END LOOP;
END
$$;

ALTER TABLE public.learning_events
  ADD CONSTRAINT learning_events_content_key_check
  CHECK (
    event_type IN ('diagnostic_completed', 'action_completed')
    OR module_key IS NOT NULL
    OR lesson_key IS NOT NULL
    OR quiz_key IS NOT NULL
  ) NOT VALID;

-- Keep the existing membership boundary and prevent a member from attributing
-- an event to another authenticated user. NULL remains valid for anonymous
-- event producers that have no user profile yet.
DROP POLICY IF EXISTS "Members can insert learning events" ON public.learning_events;
CREATE POLICY "Members can insert learning events"
  ON public.learning_events
  FOR INSERT
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.company_members cm
      WHERE cm.company_id = learning_events.company_id
        AND cm.user_id = auth.uid()
    )
  );
