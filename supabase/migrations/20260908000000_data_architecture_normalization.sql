-- Escala Digital - normalizacion aditiva de arquitectura de datos.
-- Esta migracion no elimina ni renombra columnas existentes.

-- users.id ya es el identificador de negocio usado por la app. Esta columna
-- permite vincularlo explicitamente con auth.users sin cambiar el ID existente.
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

-- Perfil empresarial estructurado. profile_json se mantiene como respaldo de
-- atributos que aun no tienen una columna normalizada.
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

-- Eventos de aprendizaje: los IDs de contenido siguen siendo las claves
-- estables actuales (por ejemplo, management-module-1); el evento tiene UUID.
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

-- Procesos de negocio normalizados por empresa. process_key permite importar
-- o sincronizar procesos sin depender de nombres visibles.
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

-- Acciones de ejecucion asociadas a un proceso y a un horizonte 30/60/90.
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

CREATE INDEX IF NOT EXISTS idx_learning_events_company_occurred
  ON public.learning_events(company_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_occurred
  ON public.learning_events(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_processes_company_status
  ON public.business_processes(company_id, status);
CREATE INDEX IF NOT EXISTS idx_business_actions_company_horizon
  ON public.business_actions(company_id, horizon_days, sort_order);
CREATE INDEX IF NOT EXISTS idx_business_actions_process
  ON public.business_actions(process_id);

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

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_profiles' AND policyname = 'Owners/admins can manage company profile') THEN
    CREATE POLICY "Owners/admins can manage company profile" ON public.company_profiles
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = company_profiles.company_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = company_profiles.company_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
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

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'business_processes' AND policyname = 'Members can view business processes') THEN
    CREATE POLICY "Members can view business processes" ON public.business_processes
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = business_processes.company_id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'business_processes' AND policyname = 'Owners/admins can manage business processes') THEN
    CREATE POLICY "Owners/admins can manage business processes" ON public.business_processes
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = business_processes.company_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = business_processes.company_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'business_actions' AND policyname = 'Members can view business actions') THEN
    CREATE POLICY "Members can view business actions" ON public.business_actions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = business_actions.company_id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'business_actions' AND policyname = 'Owners/admins can manage business actions') THEN
    CREATE POLICY "Owners/admins can manage business actions" ON public.business_actions
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = business_actions.company_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = business_actions.company_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
      );
  END IF;
END
$$;
