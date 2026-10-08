-- Read-only platform insights for users explicitly listed in platform_admins.

CREATE OR REPLACE FUNCTION public.get_platform_companies()
RETURNS TABLE (
  company_id UUID,
  company_name TEXT,
  plan_key TEXT,
  seat_limit INTEGER,
  subscription_status TEXT,
  member_count BIGINT,
  pending_invitations BIGINT,
  active_members_30d BIGINT,
  last_activity TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    c.plan_key,
    c.seat_limit,
    c.subscription_status,
    (SELECT COUNT(*) FROM public.company_members cm WHERE cm.company_id = c.id),
    (SELECT COUNT(*) FROM public.company_invitations ci
      WHERE ci.company_id = c.id AND ci.status = 'pending' AND ci.expires_at > NOW()),
    (SELECT COUNT(DISTINCT le.user_id) FROM public.learning_events le
      WHERE le.company_id = c.id AND le.occurred_at >= NOW() - INTERVAL '30 days'),
    (SELECT MAX(le.occurred_at) FROM public.learning_events le WHERE le.company_id = c.id)
  FROM public.companies c
  WHERE EXISTS (SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = auth.uid())
  ORDER BY c.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_platform_activity()
RETURNS TABLE (
  action TEXT,
  company_id UUID,
  actor_user_id UUID,
  created_at TIMESTAMPTZ,
  metadata JSONB
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT al.action, al.company_id, al.actor_user_id, al.created_at, al.metadata
  FROM public.audit_logs al
  WHERE EXISTS (SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = auth.uid())
  ORDER BY al.created_at DESC
  LIMIT 25;
$$;

REVOKE ALL ON FUNCTION public.get_platform_companies() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_companies() TO authenticated;
REVOKE ALL ON FUNCTION public.get_platform_activity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_activity() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_platform_content_metrics()
RETURNS TABLE (
  modules_count BIGINT,
  lessons_count BIGINT,
  quizzes_count BIGINT,
  processes_count BIGINT,
  actions_completed_count BIGINT,
  diagnostics_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.modules),
    (SELECT COUNT(*) FROM public.lessons),
    (SELECT COUNT(*) FROM public.quizzes),
    (SELECT COUNT(*) FROM public.business_processes),
    (SELECT COUNT(*) FROM public.learning_events WHERE event_type = 'action_completed'),
    (SELECT COUNT(*) FROM public.user_diagnostics)
  WHERE EXISTS (SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = auth.uid());
$$;

DROP FUNCTION IF EXISTS public.get_platform_companies();

CREATE OR REPLACE FUNCTION public.get_platform_companies()
RETURNS TABLE (
  company_id UUID,
  company_name TEXT,
  plan_key TEXT,
  seat_limit INTEGER,
  subscription_status TEXT,
  member_count BIGINT,
  pending_invitations BIGINT,
  active_members_30d BIGINT,
  progress_percent NUMERIC,
  completed_lessons BIGINT,
  completed_actions BIGINT,
  last_activity TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    c.plan_key,
    c.seat_limit,
    c.subscription_status,
    (SELECT COUNT(*) FROM public.company_members cm WHERE cm.company_id = c.id),
    (SELECT COUNT(*) FROM public.company_invitations ci
      WHERE ci.company_id = c.id AND ci.status = 'pending' AND ci.expires_at > NOW()),
    (SELECT COUNT(DISTINCT le.user_id) FROM public.learning_events le
      WHERE le.company_id = c.id AND le.occurred_at >= NOW() - INTERVAL '30 days'),
    COALESCE((SELECT ROUND(AVG(up.completion_percentage), 0)
      FROM public.user_progress up
      JOIN public.company_members cm ON cm.user_id = up.user_id
      WHERE cm.company_id = c.id), 0),
    (SELECT COUNT(*) FROM public.learning_events le
      WHERE le.company_id = c.id AND le.event_type = 'lesson_completed'),
    (SELECT COUNT(*) FROM public.learning_events le
      WHERE le.company_id = c.id AND le.event_type = 'action_completed'),
    (SELECT MAX(le.occurred_at) FROM public.learning_events le WHERE le.company_id = c.id)
  FROM public.companies c
  WHERE EXISTS (SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = auth.uid())
  ORDER BY c.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_platform_content_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_content_metrics() TO authenticated;
