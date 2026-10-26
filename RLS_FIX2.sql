-- Fix RLS recursion: company_members + companies
-- Ejecutar en Supabase SQL Editor (copiar desde archivo)

-- 1) Eliminar TODAS las policies existentes en company_members
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='company_members' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.company_members', pol.policyname);
  END LOOP;
END $$;

-- 2) Eliminar TODAS las policies existentes en companies
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='companies' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.companies', pol.policyname);
  END LOOP;
END $$;

-- 3) Policy limpia en company_members (sin subqueries circulares)
CREATE POLICY "Members can view memberships" ON public.company_members
  FOR SELECT USING (user_id = auth.uid());

-- 4) Policy en companies (subquery a company_members, que ya no es circular)
CREATE POLICY "Members can view companies" ON public.companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_members cm
      WHERE cm.company_id = companies.id
        AND cm.user_id = auth.uid()
    )
  );

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

-- 5) Verificacion
SELECT 'company_members policies:' AS info;
SELECT policyname, cmd FROM pg_policies WHERE schemaname='public' AND tablename='company_members';
SELECT 'companies policies:' AS info;
SELECT policyname, cmd FROM pg_policies WHERE schemaname='public' AND tablename='companies';
EOF