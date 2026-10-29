-- Admin panel direct queries fix
-- Ejecutar en SQL Editor de Supabase (xymfoqajotosdepudonh.supabase.co)

-- 1) Helper para verificar si el usuario autenticado es admin de plataforma
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

-- 2) Políticas RLS para que el panel de admin pueda leer métricas
-- Si ya existen, se reemplazan.

-- users: recuento de usuarios
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Platform admins can view users'
  ) THEN
    ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Platform admins can view users" ON public.users;
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

CREATE POLICY "Platform admins can view users"
ON public.users
FOR SELECT
TO authenticated
USING (public.is_platform_admin());

-- companies: listado de empresas para admin
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Platform admins can view companies'
  ) THEN
    ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Platform admins can view companies" ON public.companies;
    ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

CREATE POLICY "Platform admins can view companies"
ON public.companies
FOR SELECT
TO authenticated
USING (public.is_platform_admin());

-- analytics_events: actividad reciente
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'analytics_events' AND policyname = 'Platform admins can view analytics_events'
  ) THEN
    ALTER TABLE public.analytics_events DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Platform admins can view analytics_events" ON public.analytics_events;
    ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

CREATE POLICY "Platform admins can view analytics_events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (public.is_platform_admin());

-- user_diagnostics: recuento de diagnósticos
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_diagnostics' AND policyname = 'Platform admins can view user_diagnostics'
  ) THEN
    ALTER TABLE public.user_diagnostics DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Platform admins can view user_diagnostics" ON public.user_diagnostics;
    ALTER TABLE public.user_diagnostics ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

CREATE POLICY "Platform admins can view user_diagnostics"
ON public.user_diagnostics
FOR SELECT
TO authenticated
USING (public.is_platform_admin());

-- user_progress: recuento de progreso
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_progress' AND policyname = 'Platform admins can view user_progress'
  ) THEN
    ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Platform admins can view user_progress" ON public.user_progress;
    ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

CREATE POLICY "Platform admins can view user_progress"
ON public.user_progress
FOR SELECT
TO authenticated
USING (public.is_platform_admin());

-- platform_admins: permitir que el admin vea su propio registro
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'platform_admins' AND policyname = 'Admins can view own admin record'
  ) THEN
    ALTER TABLE public.platform_admins DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admins can view own admin record" ON public.platform_admins;
    ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

CREATE POLICY "Admins can view own admin record"
ON public.platform_admins
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
