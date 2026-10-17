-- Canonical company-level persistence for the process academy.
CREATE TABLE IF NOT EXISTS public.process_academy_plans (
  company_id UUID PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  plan JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.process_academy_plans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'process_academy_plans'
      AND policyname = 'Members can view company academy plan'
  ) THEN
    CREATE POLICY "Members can view company academy plan"
      ON public.process_academy_plans
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = process_academy_plans.company_id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'process_academy_plans'
      AND policyname = 'Members can manage company academy plan'
  ) THEN
    CREATE POLICY "Members can manage company academy plan"
      ON public.process_academy_plans
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = process_academy_plans.company_id
            AND cm.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = process_academy_plans.company_id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;
END
$$;
