-- V1 core foundation. Safe to run after either historical schema script.
-- It creates the company model required by the normalized migrations.

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

CREATE INDEX IF NOT EXISTS idx_users_default_company
  ON public.users(default_company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company_user
  ON public.company_members(company_id, user_id);

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
