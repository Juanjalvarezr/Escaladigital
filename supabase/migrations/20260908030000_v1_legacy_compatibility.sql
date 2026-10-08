-- V1 compatibility layer for tables still used by the React application.
-- Run after database-complete.sql and before the numbered architecture migrations.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company TEXT,
  industry TEXT,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  language TEXT NOT NULL DEFAULT 'es',
  theme TEXT NOT NULL DEFAULT 'light',
  daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  module_id TEXT,
  lesson_id TEXT,
  quiz_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  session_duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.module_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  checked JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  area_id TEXT REFERENCES public.business_areas(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL DEFAULT 'lesson',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER NOT NULL DEFAULT 30,
  attempts_allowed INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users manage own profile') THEN
    CREATE POLICY "Users manage own profile" ON public.profiles
      FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Users manage own settings') THEN
    CREATE POLICY "Users manage own settings" ON public.user_settings
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_analytics' AND policyname = 'Users manage own analytics') THEN
    CREATE POLICY "Users manage own analytics" ON public.user_analytics
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'module_feedback' AND policyname = 'Users manage own module feedback') THEN
    CREATE POLICY "Users manage own module feedback" ON public.module_feedback
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'business_areas' AND policyname = 'Authenticated users view business areas') THEN
    CREATE POLICY "Authenticated users view business areas" ON public.business_areas
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Authenticated users view modules') THEN
    CREATE POLICY "Authenticated users view modules" ON public.modules
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lessons' AND policyname = 'Authenticated users view lessons') THEN
    CREATE POLICY "Authenticated users view lessons" ON public.lessons
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quizzes' AND policyname = 'Authenticated users view quizzes') THEN
    CREATE POLICY "Authenticated users view quizzes" ON public.quizzes
      FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_created
  ON public.user_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_module_feedback_module_created
  ON public.module_feedback(module, created_at DESC);
