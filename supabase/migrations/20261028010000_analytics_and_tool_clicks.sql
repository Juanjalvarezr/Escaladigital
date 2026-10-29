-- Analytics events and tool clicks tracking for Escala Digital.
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tool_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  tool_key TEXT NOT NULL,
  tool_url TEXT,
  source_type TEXT,
  source_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_company_created
  ON public.analytics_events(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_clicks_company_created
  ON public.tool_clicks(company_id, created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_clicks ENABLE ROW LEVEL SECURITY;

-- analytics_events: admin can view for platform insights; members can insert their own events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'analytics_events' AND policyname = 'Platform admins can view analytics_events'
  ) THEN
    CREATE POLICY "Platform admins can view analytics_events"
      ON public.analytics_events FOR SELECT
      TO authenticated USING (public.is_platform_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'analytics_events' AND policyname = 'Members can insert analytics events'
  ) THEN
    CREATE POLICY "Members can insert analytics events"
      ON public.analytics_events FOR INSERT
      TO authenticated WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = analytics_events.company_id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- tool_clicks: admin can view for platform insights; members can insert their own clicks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tool_clicks' AND policyname = 'Platform admins can view tool_clicks'
  ) THEN
    CREATE POLICY "Platform admins can view tool_clicks"
      ON public.tool_clicks FOR SELECT
      TO authenticated USING (public.is_platform_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tool_clicks' AND policyname = 'Members can insert tool clicks'
  ) THEN
    CREATE POLICY "Members can insert tool clicks"
      ON public.tool_clicks FOR INSERT
      TO authenticated WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.company_members cm
          WHERE cm.company_id = tool_clicks.company_id
            AND cm.user_id = auth.uid()
        )
      );
  END IF;
END
$$;
