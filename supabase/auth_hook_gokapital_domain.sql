-- GoKapital Auth Hook: Restrict Registration to @gokapital.com
-- 
-- This SQL creates a "Before User Created" Auth Hook function that
-- validates the email domain before allowing account creation.
--
-- IMPORTANT: After running this SQL, you must activate the hook in the
-- Supabase Dashboard:
--   Authentication -> Hooks -> Before User Created -> select this function

CREATE OR REPLACE FUNCTION public.restrict_registration_to_gokapital()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  normalized_email TEXT;
  at_pos INT;
  username_part TEXT;
  domain_part TEXT;
BEGIN
  normalized_email := lower(btrim(event_data->>'email'));
  at_pos := position('@' in normalized_email);
  IF at_pos < 2 THEN
    RETURN jsonb_build_object('error', 'A valid email address is required.', 'decision', 'deny');
  END IF;
  username_part := left(normalized_email, at_pos - 1);
  domain_part := substring(normalized_email from at_pos + 1);
  IF username_part = '' OR username_part IS NULL THEN
    RETURN jsonb_build_object('error', 'A valid email address is required.', 'decision', 'deny');
  END IF;
  IF domain_part <> 'gokapital.com' THEN
    RETURN jsonb_build_object('error', 'Only verified @gokapital.com email addresses can register.', 'decision', 'deny');
  END IF;
  RETURN jsonb_build_object('decision', 'continue');
END;
$$;

REVOKE ALL ON FUNCTION public.restrict_registration_to_gokapital() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restrict_registration_to_gokapital() TO supabase_auth_admin;