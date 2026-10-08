-- Company invitations and membership onboarding for the V1 multi-company flow.

CREATE TABLE IF NOT EXISTS public.company_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  areas TEXT[] NOT NULL DEFAULT '{}',
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_invitations_company_status
  ON public.company_invitations(company_id, status);
CREATE INDEX IF NOT EXISTS idx_company_invitations_token
  ON public.company_invitations(token);

ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

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
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = p_company_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para invitar miembros a esta empresa';
  END IF;

  IF normalized_email = '' OR position('@' IN normalized_email) < 2 THEN
    RAISE EXCEPTION 'El correo de invitación no es válido';
  END IF;

  IF p_role NOT IN ('admin', 'member') THEN
    RAISE EXCEPTION 'El rol de invitación no es válido';
  END IF;

  UPDATE public.company_invitations
  SET status = 'revoked'
  WHERE company_id = p_company_id
    AND lower(email) = normalized_email
    AND status = 'pending';

  INSERT INTO public.company_invitations (company_id, email, role, areas, invited_by)
  VALUES (p_company_id, normalized_email, p_role, COALESCE(p_areas, '{}'), auth.uid())
  RETURNING * INTO new_invitation;

  RETURN QUERY SELECT new_invitation.id, new_invitation.token, new_invitation.expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_company_invitation(p_token UUID)
RETURNS TABLE (company_id UUID, company_name TEXT, role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation public.company_invitations;
  current_email TEXT := lower(COALESCE(auth.jwt() ->> 'email', ''));
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para aceptar una invitación';
  END IF;

  SELECT * INTO invitation
  FROM public.company_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > NOW()
  FOR UPDATE;

  IF invitation.id IS NULL THEN
    RAISE EXCEPTION 'La invitación no existe, expiró o ya fue utilizada';
  END IF;

  IF invitation.email <> current_email THEN
    RAISE EXCEPTION 'La invitación fue creada para otro correo electrónico';
  END IF;

  INSERT INTO public.company_members (company_id, user_id, role, areas)
  VALUES (invitation.company_id, auth.uid(), invitation.role, invitation.areas)
  ON CONFLICT (company_id, user_id) DO NOTHING;

  UPDATE public.users
  SET default_company_id = COALESCE(default_company_id, invitation.company_id)
  WHERE id = auth.uid();

  UPDATE public.company_invitations
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = invitation.id;

  RETURN QUERY
  SELECT c.id, c.name, invitation.role
  FROM public.companies c
  WHERE c.id = invitation.company_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_company_members(p_company_id UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  email TEXT,
  role TEXT,
  areas TEXT[],
  joined_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, COALESCE(u.display_name, u.email), u.email, cm.role, cm.areas, cm.created_at
  FROM public.company_members cm
  JOIN public.users u ON u.id = cm.user_id
  WHERE cm.company_id = p_company_id
    AND EXISTS (
      SELECT 1 FROM public.company_members viewer
      WHERE viewer.company_id = p_company_id AND viewer.user_id = auth.uid()
    )
  ORDER BY cm.created_at;
$$;

REVOKE ALL ON FUNCTION public.create_company_invitation(UUID, TEXT, TEXT, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_company_invitation(UUID, TEXT, TEXT, TEXT[]) TO authenticated;
REVOKE ALL ON FUNCTION public.claim_company_invitation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_company_invitation(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.list_company_members(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_company_members(UUID) TO authenticated;
