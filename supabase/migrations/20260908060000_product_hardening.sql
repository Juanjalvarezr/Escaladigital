-- Product hardening: plans, seat limits, member management and auditability.
-- Additive migration; it does not remove or rename existing V1 objects.

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS plan_key TEXT NOT NULL DEFAULT 'starter'
    CHECK (plan_key IN ('starter', 'team', 'business', 'custom')),
  ADD COLUMN IF NOT EXISTS seat_limit INTEGER NOT NULL DEFAULT 5
    CHECK (seat_limit > 0),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active'
    CHECK (subscription_status IN ('trialing', 'active', 'paused', 'canceled'));

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_platform_summary()
RETURNS TABLE (
  company_count BIGINT,
  user_count BIGINT,
  active_company_count BIGINT,
  event_count_30d BIGINT
)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.companies),
    (SELECT COUNT(*) FROM public.users),
    (SELECT COUNT(*) FROM public.companies WHERE subscription_status IN ('trialing', 'active')),
    (SELECT COUNT(*) FROM public.learning_events WHERE occurred_at >= NOW() - INTERVAL '30 days')
  WHERE EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid());
$$;

CREATE INDEX IF NOT EXISTS idx_audit_logs_company_created
  ON public.audit_logs(company_id, created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.write_company_audit(
  p_company_id UUID,
  p_action TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = p_company_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No tienes acceso a esta empresa';
  END IF;
  INSERT INTO public.audit_logs(company_id, actor_user_id, action, target_user_id, metadata)
  VALUES (p_company_id, auth.uid(), p_action, p_target_user_id, COALESCE(p_metadata, '{}'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION public.create_company_invitation(
  p_company_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'member',
  p_areas TEXT[] DEFAULT '{}'
)
RETURNS TABLE (invitation_id UUID, invitation_token UUID, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email TEXT := lower(trim(p_email));
  new_invitation public.company_invitations;
  current_seats INTEGER;
  max_seats INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = p_company_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para invitar miembros a esta empresa';
  END IF;
  IF normalized_email = '' OR position('@' IN normalized_email) < 2 THEN
    RAISE EXCEPTION 'El correo de invitación no es válido';
  END IF;
  IF p_role NOT IN ('admin', 'member') THEN
    RAISE EXCEPTION 'El rol de invitación no es válido';
  END IF;

  SELECT seat_limit INTO max_seats FROM public.companies WHERE id = p_company_id;
  SELECT COUNT(*)::INTEGER INTO current_seats FROM public.company_members WHERE company_id = p_company_id;
  current_seats := current_seats + (
    SELECT COUNT(*)::INTEGER FROM public.company_invitations
    WHERE company_id = p_company_id AND status = 'pending' AND expires_at > NOW()
  );
  IF current_seats >= COALESCE(max_seats, 5) THEN
    RAISE EXCEPTION 'Has alcanzado el límite de personas de tu plan';
  END IF;

  UPDATE public.company_invitations
  SET status = 'revoked'
  WHERE company_id = p_company_id AND lower(email) = normalized_email AND status = 'pending';

  INSERT INTO public.company_invitations (company_id, email, role, areas, invited_by)
  VALUES (p_company_id, normalized_email, p_role, COALESCE(p_areas, '{}'), auth.uid())
  RETURNING * INTO new_invitation;

  INSERT INTO public.audit_logs(company_id, actor_user_id, action, metadata)
  VALUES (p_company_id, auth.uid(), 'invitation.created',
    jsonb_build_object('email', normalized_email, 'role', p_role));
  RETURN QUERY SELECT new_invitation.id, new_invitation.token, new_invitation.expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_company_invitations(p_company_id UUID)
RETURNS TABLE (invitation_id UUID, email TEXT, role TEXT, status TEXT, expires_at TIMESTAMPTZ, created_at TIMESTAMPTZ)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT i.id, i.email, i.role, i.status, i.expires_at, i.created_at
  FROM public.company_invitations i
  WHERE i.company_id = p_company_id
    AND EXISTS (SELECT 1 FROM public.company_members m
                WHERE m.company_id = p_company_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
  ORDER BY i.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.revoke_company_invitation(p_invitation_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE invitation public.company_invitations;
BEGIN
  SELECT * INTO invitation FROM public.company_invitations WHERE id = p_invitation_id FOR UPDATE;
  IF invitation.id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.company_members WHERE company_id = invitation.company_id
      AND user_id = auth.uid() AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para revocar esta invitación';
  END IF;
  UPDATE public.company_invitations SET status = 'revoked' WHERE id = p_invitation_id AND status = 'pending';
  INSERT INTO public.audit_logs(company_id, actor_user_id, action, metadata)
  VALUES (invitation.company_id, auth.uid(), 'invitation.revoked', jsonb_build_object('invitation_id', p_invitation_id));
END;
$$;

CREATE OR REPLACE FUNCTION public.update_company_member_role(p_company_id UUID, p_user_id UUID, p_role TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_role NOT IN ('admin', 'member') OR NOT EXISTS (
    SELECT 1 FROM public.company_members WHERE company_id = p_company_id AND user_id = auth.uid() AND role = 'owner'
  ) THEN
    RAISE EXCEPTION 'Solo el propietario puede cambiar roles a este nivel';
  END IF;
  IF p_user_id = auth.uid() OR NOT EXISTS (
    SELECT 1 FROM public.company_members WHERE company_id = p_company_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'El miembro no es válido para esta operación';
  END IF;
  UPDATE public.company_members SET role = p_role WHERE company_id = p_company_id AND user_id = p_user_id AND role <> 'owner';
  INSERT INTO public.audit_logs(company_id, actor_user_id, action, target_user_id, metadata)
  VALUES (p_company_id, auth.uid(), 'member.role_updated', p_user_id, jsonb_build_object('role', p_role));
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_company_member(p_company_id UUID, p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_user_id = auth.uid() OR NOT EXISTS (
    SELECT 1 FROM public.company_members WHERE company_id = p_company_id AND user_id = auth.uid() AND role = 'owner'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.company_members WHERE company_id = p_company_id AND user_id = p_user_id AND role <> 'owner'
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para retirar este miembro';
  END IF;
  DELETE FROM public.company_members WHERE company_id = p_company_id AND user_id = p_user_id;
  INSERT INTO public.audit_logs(company_id, actor_user_id, action, target_user_id)
  VALUES (p_company_id, auth.uid(), 'member.removed', p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_company_team_metrics(p_company_id UUID)
RETURNS TABLE (
  member_count BIGINT,
  active_members BIGINT,
  pending_invitations BIGINT,
  completed_events BIGINT,
  completed_actions BIGINT
)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.company_members WHERE company_id = p_company_id),
    (SELECT COUNT(DISTINCT user_id) FROM public.learning_events
      WHERE company_id = p_company_id AND occurred_at >= NOW() - INTERVAL '30 days'),
    (SELECT COUNT(*) FROM public.company_invitations
      WHERE company_id = p_company_id AND status = 'pending' AND expires_at > NOW()),
    (SELECT COUNT(*) FROM public.learning_events
      WHERE company_id = p_company_id AND event_type IN ('lesson_completed', 'quiz_completed')),
    (SELECT COUNT(*) FROM public.learning_events
      WHERE company_id = p_company_id AND event_type = 'action_completed')
  WHERE EXISTS (SELECT 1 FROM public.company_members WHERE company_id = p_company_id AND user_id = auth.uid() AND role IN ('owner', 'admin'));
$$;

REVOKE ALL ON FUNCTION public.list_company_invitations(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_company_invitations(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.revoke_company_invitation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_company_invitation(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.update_company_member_role(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_company_member_role(UUID, UUID, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.remove_company_member(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_company_member(UUID, UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.get_company_team_metrics(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_company_team_metrics(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.get_platform_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_summary() TO authenticated;
