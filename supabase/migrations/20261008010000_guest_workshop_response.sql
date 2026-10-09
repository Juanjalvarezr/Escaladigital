ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS action_response TEXT;