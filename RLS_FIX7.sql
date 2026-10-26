-- Drop all and recreate with explicit authenticated role
DROP POLICY IF EXISTS "allow_insert_companies" ON public.companies;
DROP POLICY IF EXISTS "companies_insert" ON public.companies;
CREATE POLICY "allow_insert_companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
EOF