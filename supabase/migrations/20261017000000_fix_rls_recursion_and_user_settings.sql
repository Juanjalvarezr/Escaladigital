-- Migration: Fix RLS Infinite Recursion on company_members and create user_settings
-- Date: 2026-10-17

-- 1. Eliminar políticas recursivas previas en company_members y companies
DROP POLICY IF EXISTS "Members can view memberships" ON public.company_members;
DROP POLICY IF EXISTS "Members can view companies" ON public.companies;
DROP POLICY IF EXISTS "Owners can update companies" ON public.companies;

-- 2. Política limpia en company_members:
-- Cada usuario consulta directamente sus registros de membresía sin subqueries circulares.
-- (Para listar compañeros de equipo se usa la función RPC list_company_members existente)
CREATE POLICY "Members can view memberships" ON public.company_members
  FOR SELECT USING (user_id = auth.uid());

-- 3. Política en companies:
-- Permite ver las empresas a las cuales pertenece el usuario actual.
CREATE POLICY "Members can view companies" ON public.companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = companies.id
        AND cm.user_id = auth.uid()
    )
  );

-- 4. Política de actualización en companies para owners y admins
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

-- 5. Tabla user_settings (si no fue creada previamente)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  language TEXT NOT NULL DEFAULT 'es',
  theme TEXT NOT NULL DEFAULT 'dark',
  daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own settings" ON public.user_settings;
CREATE POLICY "Users manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
