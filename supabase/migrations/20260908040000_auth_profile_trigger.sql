-- Create the application profile when an auth user is created.
-- This also works when email confirmation delays the client session.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    display_name,
    company,
    industry,
    interests
  )
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'display_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'company', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'industry', ''),
    CASE
      WHEN jsonb_typeof(NEW.raw_user_meta_data -> 'interests') = 'array'
      THEN ARRAY(
        SELECT jsonb_array_elements_text(NEW.raw_user_meta_data -> 'interests')
      )
      ELSE '{}'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    company = COALESCE(EXCLUDED.company, public.users.company),
    industry = COALESCE(EXCLUDED.industry, public.users.industry),
    interests = CASE
      WHEN cardinality(EXCLUDED.interests) > 0 THEN EXCLUDED.interests
      ELSE public.users.interests
    END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
