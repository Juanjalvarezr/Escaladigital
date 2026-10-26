-- Re-enable RLS and create single permissive INSERT policy
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='companies' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.companies', pol.policyname);
  END LOOP;
END $$;

-- Recreate minimal policies
CREATE POLICY "companies_select" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "companies_insert" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "companies_update" ON public.companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EOF