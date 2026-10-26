-- Fix: companies INSERT permission (recreate all policies cleanly)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='companies' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.companies', pol.policyname);
  END LOOP;
END $$;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='company_members' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.company_members', pol.policyname);
  END LOOP;
END $$;

-- companies policies
CREATE POLICY "companies_select" ON public.companies FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = companies.id AND cm.user_id = auth.uid())
);
CREATE POLICY "companies_insert" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "companies_update" ON public.companies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = companies.id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.company_members cm WHERE cm.company_id = companies.id AND cm.user_id = auth.uid() AND cm.role IN ('owner','admin'))
);

-- company_members policies
CREATE POLICY "members_select" ON public.company_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "members_insert" ON public.company_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- Verify
SELECT 'companies:' AS info;
SELECT policyname, cmd FROM pg_policies WHERE schemaname='public' AND tablename='companies';
SELECT 'company_members:' AS info;
SELECT policyname, cmd FROM pg_policies WHERE schemaname='public' AND tablename='company_members';
EOF