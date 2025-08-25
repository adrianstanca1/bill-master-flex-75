-- Critical Security Fix 1: Secure Database Functions
-- Update all functions to use secure search_path

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Validate input
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  -- Insert profile with error handling and enforce company assignment requirement
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name,
    company_id, -- Enforce this will be set later through proper flow
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NULL, -- Will be set through setup process
    now(),
    now()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Fix other critical functions with secure search_path
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.company_members m
      WHERE m.company_id = _company_id
        AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.company_members m
      WHERE m.company_id = _company_id
        AND m.user_id = auth.uid()
        AND m.role = 'admin'
    )
  );
$function$;

-- Critical Security Fix 2: Enhanced Profile Security
-- Add trigger to ensure company association validation
CREATE OR REPLACE FUNCTION public.validate_profile_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- For existing users, ensure company_id changes are properly authorized
  IF TG_OP = 'UPDATE' AND NEW.company_id IS DISTINCT FROM OLD.company_id THEN
    -- Only allow company changes if user is admin of old company or if old company was null
    IF OLD.company_id IS NOT NULL AND NOT (
      SELECT public.is_company_admin(OLD.company_id)
    ) THEN
      RAISE EXCEPTION 'Unauthorized company assignment change';
    END IF;
    
    -- Log security event for company changes
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource_type,
      details
    ) VALUES (
      auth.uid(),
      'COMPANY_ASSIGNMENT_CHANGED',
      'profile_security',
      jsonb_build_object(
        'old_company_id', OLD.company_id,
        'new_company_id', NEW.company_id,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_profile_security_trigger ON public.profiles;
CREATE TRIGGER validate_profile_security_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_security();

-- Critical Security Fix 3: Enhanced Brute Force Protection
CREATE OR REPLACE FUNCTION public.detect_brute_force_attempts(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  failed_attempts integer;
  ip_attempts integer;
BEGIN
  -- Count failed login attempts in last 15 minutes for user
  SELECT COUNT(*) INTO failed_attempts
  FROM public.security_audit_log
  WHERE user_id = check_user_id
    AND action IN ('LOGIN_FAILED', 'PASSWORD_RESET_FAILED')
    AND created_at > NOW() - INTERVAL '15 minutes';
  
  -- Count failed attempts from same IP in last hour
  SELECT COUNT(*) INTO ip_attempts
  FROM public.security_audit_log
  WHERE details ->> 'ip_address' = (
    SELECT details ->> 'ip_address' 
    FROM public.security_audit_log 
    WHERE user_id = check_user_id 
    ORDER BY created_at DESC 
    LIMIT 1
  )
    AND action IN ('LOGIN_FAILED', 'PASSWORD_RESET_FAILED')
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Return true if more than 5 failed attempts from user OR more than 10 from IP
  RETURN failed_attempts > 5 OR ip_attempts > 10;
END;
$function$;

-- Critical Security Fix 4: Enhanced Session Security
CREATE OR REPLACE FUNCTION public.validate_session_security()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result jsonb := '{}';
  user_profile record;
  session_age interval;
  ip_address text;
BEGIN
  -- Check if user exists and has valid company association
  SELECT * INTO user_profile FROM public.profiles WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    result := jsonb_build_object(
      'valid', false,
      'reason', 'User profile not found'
    );
    RETURN result;
  END IF;
  
  -- Allow temporary access for users without company (for setup process)
  -- But log this as a security event for monitoring
  IF user_profile.company_id IS NULL THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource_type,
      details
    ) VALUES (
      auth.uid(),
      'NO_COMPANY_ASSOCIATION',
      'session_security',
      jsonb_build_object(
        'timestamp', now(),
        'requires_setup', true
      )
    );
    
    result := jsonb_build_object(
      'valid', true,
      'requires_setup', true,
      'user_id', user_profile.id,
      'company_id', null,
      'role', user_profile.role
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
    'role', user_profile.role,
    'session_age_hours', EXTRACT(EPOCH FROM session_age) / 3600
  );
  
  RETURN result;
END;
$function$;