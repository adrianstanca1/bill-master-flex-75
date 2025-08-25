-- Phase 1: Critical Database Security Fixes (Fixed)

-- 1. Fix nullable company_id in profiles table (critical security issue)
-- First check if there are any profiles without company_id and handle them
UPDATE public.profiles 
SET company_id = (
  SELECT c.id FROM public.companies c WHERE c.owner_user_id = profiles.id LIMIT 1
)
WHERE company_id IS NULL AND EXISTS (
  SELECT 1 FROM public.companies c WHERE c.owner_user_id = profiles.id
);

-- Remove profiles that cannot be fixed (orphaned profiles)
DELETE FROM public.profiles WHERE company_id IS NULL;

-- Now make company_id NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN company_id SET NOT NULL;

-- 2. Add foreign key constraint only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_company_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Create CSRF protection function
CREATE OR REPLACE FUNCTION public.validate_csrf_token(token text, expected text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simple CSRF token validation
  RETURN token = expected AND LENGTH(token) >= 32;
END;
$$;

-- 4. Enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  user_identifier text,
  action_type text,
  max_attempts integer DEFAULT 5,
  time_window interval DEFAULT '1 hour'::interval
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*) INTO attempt_count
  FROM security_audit_log
  WHERE details ->> 'user_identifier' = user_identifier
    AND action = action_type
    AND created_at > NOW() - time_window;
    
  RETURN attempt_count < max_attempts;
END;
$$;

-- 5. Enhanced session validation function
CREATE OR REPLACE FUNCTION public.validate_session_security()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb := '{}';
  user_profile record;
  session_age interval;
BEGIN
  -- Check if user exists and has valid company association
  SELECT * INTO user_profile FROM profiles WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    result := jsonb_build_object(
      'valid', false,
      'reason', 'User profile not found'
    );
    RETURN result;
  END IF;
  
  IF user_profile.company_id IS NULL THEN
    result := jsonb_build_object(
      'valid', false,
      'reason', 'User has no company association'
    );
    RETURN result;
  END IF;
  
  -- Check session age (sessions older than 24 hours should be refreshed)
  session_age := NOW() - (auth.jwt() ->> 'iat')::bigint::timestamp;
  
  IF session_age > '24 hours'::interval THEN
    result := jsonb_build_object(
      'valid', false,
      'reason', 'Session too old, refresh required'
    );
    RETURN result;
  END IF;
  
  result := jsonb_build_object(
    'valid', true,
    'user_id', user_profile.id,
    'company_id', user_profile.company_id,
    'role', user_profile.role
  );
  
  RETURN result;
END;
$$;