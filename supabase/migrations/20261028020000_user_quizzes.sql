-- User quizzes persistence for Escala Digital.
CREATE TABLE IF NOT EXISTS public.user_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quizzes_user_module
  ON public.user_quizzes(user_id, module_id);

ALTER TABLE public.user_quizzes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_quizzes' AND policyname = 'Users manage own quizzes'
  ) THEN
    CREATE POLICY "Users manage own quizzes"
      ON public.user_quizzes FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
