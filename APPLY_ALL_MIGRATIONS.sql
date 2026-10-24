-- ============================================
-- ESCALA DIGITAL - MIGRACIONES COMPLETAS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- MIGRACIÓN 1: Core Foundation (v1)
-- Crea tablas básicas: companies, users, company_members
-- ============================================

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  profile_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  profile_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  company TEXT,
  industry TEXT,
  interests TEXT[],
  default_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  areas TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_default_company ON public.users(default_company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company_user ON public.company_members(company_id, user_id);

-- RLS Policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own account') THEN
    CREATE POLICY "Users can view own account" ON public.users
      FOR SELECT USING (id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can create own account') THEN
    CREATE POLICY "Users can create own account" ON public.users
      FOR INSERT WITH CHECK (id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own account') THEN
    CREATE POLICY "Users can update own account" ON public.users
      FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Authenticated users can create companies') THEN
    CREATE POLICY "Authenticated users can create companies" ON public.companies
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Members can view companies') THEN
    CREATE POLICY "Members can view companies" ON public.companies
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Owners can update companies') THEN
    CREATE POLICY "Owners can update companies" ON public.companies
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_members' AND policyname = 'Members can view memberships') THEN
    CREATE POLICY "Members can view memberships" ON public.company_members
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.company_members own_membership
          WHERE own_membership.company_id = company_members.company_id
            AND own_membership.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_members' AND policyname = 'Users can create own owner membership') THEN
    CREATE POLICY "Users can create own owner membership" ON public.company_members
      FOR INSERT WITH CHECK (user_id = auth.uid() AND role = 'owner');
  END IF;
END
$$;

-- MIGRACIÓN 2: Data Architecture Normalization
-- Añade tablas adicionales para learning events, business processes
-- ============================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_user_id UUID;

UPDATE public.users AS u
SET auth_user_id = u.id
WHERE u.auth_user_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM auth.users AS au
    WHERE au.id = u.id
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_user_id
  ON public.users(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_auth_user_id_fkey'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_auth_user_id_fkey
      FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.company_profiles (
  company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  legal_name TEXT,
  industry TEXT,
  company_size TEXT,
  country_code TEXT,
  city TEXT,
  website TEXT,
  business_model TEXT,
  description TEXT,
  primary_challenge TEXT,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  profile_version INTEGER NOT NULL DEFAULT 1 CHECK (profile_version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  module_key TEXT,
  lesson_key TEXT,
  quiz_key TEXT,
  session_id TEXT,
  event_properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (module_key IS NOT NULL OR lesson_key IS NOT NULL OR quiz_key IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.business_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  process_key TEXT NOT NULL,
  name TEXT NOT NULL,
  area_key TEXT,
  description TEXT,
  owner_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, process_key)
);

CREATE TABLE IF NOT EXISTS public.business_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  process_id UUID REFERENCES public.business_processes(id) ON DELETE SET NULL,
  owner_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  horizon_days INTEGER NOT NULL CHECK (horizon_days IN (30, 60, 90)),
  action_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'done', 'cancelled')),
  due_on DATE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, action_key)
);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_learning_events_company_occurred ON public.learning_events(company_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_occurred ON public.learning_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_processes_company_status ON public.business_processes(company_id, status);
CREATE INDEX IF NOT EXISTS idx_business_actions_company_horizon ON public.business_actions(company_id, horizon_days, sort_order);
CREATE INDEX IF NOT EXISTS idx_business_actions_process ON public.business_actions(process_id);

-- RLS para tablas nuevas
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_actions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_profiles' AND policyname = 'Members can view company profile') THEN
    CREATE POLICY "Members can view company profile" ON public.company_profiles
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = company_profiles.company_id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'learning_events' AND policyname = 'Members can insert learning events') THEN
    CREATE POLICY "Members can insert learning events" ON public.learning_events
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = learning_events.company_id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'learning_events' AND policyname = 'Owners/admins can view learning events') THEN
    CREATE POLICY "Owners/admins can view learning events" ON public.learning_events
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = learning_events.company_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
      );
  END IF;
END
$$;

-- MIGRACIÓN 3: Tablas de aprendizaje existentes
-- user_progress, user_lessons, user_quizzes, user_diagnostics
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  quiz_score INTEGER,
  lessons_completed TEXT[] NOT NULL DEFAULT '{}',
  last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.user_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT[] NOT NULL DEFAULT '{}',
  "order" INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.user_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_answers INTEGER[] NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.user_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL,
  main_challenge TEXT NOT NULL,
  business_description TEXT NOT NULL,
  executive_summary TEXT,
  generation_source TEXT,
  scalability_roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_modules TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS para tablas de aprendizaje
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_diagnostics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can manage own progress') THEN
    CREATE POLICY "Users can manage own progress" ON public.user_progress
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_lessons' AND policyname = 'Users can manage own lessons') THEN
    CREATE POLICY "Users can manage own lessons" ON public.user_lessons
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_quizzes' AND policyname = 'Users can manage own quizzes') THEN
    CREATE POLICY "Users can manage own quizzes" ON public.user_quizzes
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_diagnostics' AND policyname = 'Users can manage own diagnostics') THEN
    CREATE POLICY "Users can manage own diagnostics" ON public.user_diagnostics
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- MIGRACIÓN 4: Tablas de analítica
-- analytics_events, tool_clicks
-- ============================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tool_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  tool_key TEXT NOT NULL,
  tool_url TEXT,
  source_type TEXT,
  source_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS para analítica
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_clicks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Members can insert analytics') THEN
    CREATE POLICY "Members can insert analytics" ON public.analytics_events
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = analytics_events.company_id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Owners/admins can view analytics') THEN
    CREATE POLICY "Owners/admins can view analytics" ON public.analytics_events
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = analytics_events.company_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tool_clicks' AND policyname = 'Members can insert tool clicks') THEN
    CREATE POLICY "Members can insert tool clicks" ON public.tool_clicks
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = tool_clicks.company_id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- MIGRACIÓN 5: Tablas de admin
-- platform_admins, admin_feedback
-- ============================================

CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS para admin
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'platform_admins' AND policyname = 'Admins can manage platform_admins') THEN
    CREATE POLICY "Admins can manage platform_admins" ON public.platform_admins
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.platform_admins pa
          WHERE pa.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.platform_admins pa
          WHERE pa.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que todas las tablas existen
DO $$
DECLARE
  current_table_name TEXT;
  missing_tables TEXT[] := '{}';
  table_array TEXT[] := ARRAY[
    'companies', 'users', 'company_members', 'company_profiles',
    'learning_events', 'business_processes', 'business_actions',
    'user_progress', 'user_lessons', 'user_quizzes', 'user_diagnostics',
    'analytics_events', 'tool_clicks', 'platform_admins', 'admin_feedback'
  ];
BEGIN
  FOREACH current_table_name IN ARRAY table_array
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = current_table_name
    ) THEN
      missing_tables := array_append(missing_tables, current_table_name);
    END IF;
  END LOOP;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE 'Tablas faltantes: %', missing_tables;
  ELSE
    RAISE NOTICE '✅ Todas las tablas han sido creadas exitosamente';
  END IF;
END
$$;
