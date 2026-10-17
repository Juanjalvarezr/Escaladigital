CREATE OR REPLACE FUNCTION public.get_platform_feedback()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  module TEXT,
  checked JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mf.id, mf.user_id, mf.module, mf.checked, mf.created_at
  FROM public.module_feedback mf
  WHERE EXISTS (
    SELECT 1 FROM public.platform_admins pa WHERE pa.user_id = auth.uid()
  )
  ORDER BY mf.created_at DESC
  LIMIT 500;
$$;

REVOKE ALL ON FUNCTION public.get_platform_feedback() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_platform_feedback() TO authenticated;
