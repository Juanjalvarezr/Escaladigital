CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  quiz_score INTEGER,
  lessons_completed TEXT[] NOT NULL DEFAULT '{}',
  last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.user_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL,
  main_challenge TEXT NOT NULL,
  business_description TEXT NOT NULL,
  scalability_roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_modules TEXT[] NOT NULL DEFAULT '{}',
  executive_summary TEXT,
  generation_source TEXT NOT NULL DEFAULT 'ai' CHECK (generation_source IN ('ai', 'fallback')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS employees_count TEXT,
  ADD COLUMN IF NOT EXISTS business_description TEXT,
  ADD COLUMN IF NOT EXISTS goals TEXT,
  ADD COLUMN IF NOT EXISTS main_challenge TEXT;

ALTER TABLE public.user_diagnostics
  ADD COLUMN IF NOT EXISTS executive_summary TEXT,
  ADD COLUMN IF NOT EXISTS generation_source TEXT NOT NULL DEFAULT 'ai';

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_diagnostics ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_diagnostics_latest
  ON public.user_diagnostics(user_id, created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_progress' AND policyname = 'Users manage own learning progress'
  ) THEN
    CREATE POLICY "Users manage own learning progress" ON public.user_progress
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_diagnostics' AND policyname = 'Users manage own diagnostics v2'
  ) THEN
    CREATE POLICY "Users manage own diagnostics v2" ON public.user_diagnostics
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$;