-- Fix: allow users to create their own company and membership
-- (needed for ensureCompanyForUser flow)

-- companies: INSERT policy
DROP POLICY IF EXISTS "Users can create own company" ON public.companies;
CREATE POLICY "Users can create own company" ON public.companies
  FOR INSERT WITH CHECK (true);

-- company_members: INSERT policy (user can add themselves)
DROP POLICY IF EXISTS "Users can add themselves as member" ON public.company_members;
CREATE POLICY "Users can add themselves as member" ON public.company_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Verificacion
SELECT 'companies policies:' AS info;
SELECT policyname, cmd FROM pg_policies WHERE schemaname='public' AND tablename='companies';
SELECT 'company_members policies:' AS info;
SELECT policyname, cmd FROM pg_policies WHERE schemaname='public' AND tablename='company_members';
EOF