-- Critical Security Fixes Migration (Corrected)

-- 1. Fix Clients Table RLS Over-Permission Issue
DROP POLICY IF EXISTS "Clients role-based access control" ON public.clients;

CREATE POLICY "Clients admin manager only access" 
ON public.clients 
FOR ALL 
USING (is_company_member(company_id) AND is_admin_or_manager(auth.uid()))
WITH CHECK (is_company_member(company_id) AND is_admin_or_manager(auth.uid()));

-- 2. Strengthen Profile Access Controls - Drop existing policies first
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Company admins can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users without company can view own profile" ON public.profiles;

-- Create consolidated secure profile policies
CREATE POLICY "Profile owner access" 
ON public.profiles 
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Company admin member view" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != id AND 
  company_id IS NOT NULL AND 
  is_company_admin(company_id)
);

-- 3. Enhanced OAuth State Security Function
CREATE OR REPLACE FUNCTION public.store_oauth_state_secure(
  state_token text,
  session_id text DEFAULT NULL,
  expires_minutes integer DEFAULT 10
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  token_id uuid;
  client_ip text;
BEGIN
  -- Validate input parameters
  IF state_token IS NULL OR LENGTH(state_token) < 32 THEN
    RAISE EXCEPTION 'Invalid state token provided';
  END IF;
  
  -- Get client IP for security logging
  client_ip := current_setting('request.headers', true)::json ->> 'x-forwarded-for';
  
  -- Insert OAuth state with enhanced security
  INSERT INTO public.oauth_state_store (
    state_token,
    user_session_id,
    expires_at
  ) VALUES (
    state_token,
    session_id,
    NOW() + (expires_minutes || ' minutes')::interval
  ) RETURNING id INTO token_id;
  
  -- Log OAuth state creation for security monitoring
  INSERT INTO public.security_audit_log (
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    'OAUTH_STATE_CREATED',
    'oauth_security',
    token_id,
    jsonb_build_object(
      'state_length', LENGTH(state_token),
      'expires_at', NOW() + (expires_minutes || ' minutes')::interval,
      'client_ip', client_ip,
      'timestamp', NOW()
    )
  );
  
  RETURN token_id;
END;
$$;

-- 4. Enhanced Rate Limiting for Authentication Operations
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
  identifier text,
  action_type text DEFAULT 'authentication',
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 15
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  attempt_count integer;
  is_blocked boolean := false;
  reset_time timestamp with time zone;
  result jsonb;
BEGIN
  -- Count recent attempts within the time window
  SELECT COUNT(*) INTO attempt_count
  FROM public.security_audit_log
  WHERE (details ->> 'identifier' = identifier OR details ->> 'ip_address' = identifier)
    AND action LIKE action_type || '%'
    AND created_at > NOW() - (window_minutes || ' minutes')::interval;
    
  -- Determine if user should be blocked
  IF attempt_count >= max_attempts THEN
    is_blocked := true;
    reset_time := NOW() + '1 hour'::interval;
    
    -- Log rate limit violation
    INSERT INTO public.security_events (
      event_type,
      severity,
      details
    ) VALUES (
      'RATE_LIMIT_EXCEEDED',
      'high',
      jsonb_build_object(
        'identifier', identifier,
        'action_type', action_type,
        'attempt_count', attempt_count,
        'max_attempts', max_attempts,
        'blocked_until', reset_time
      )
    );
  END IF;
  
  result := jsonb_build_object(
    'allowed', NOT is_blocked,
    'attempts_remaining', GREATEST(0, max_attempts - attempt_count),
    'reset_time', reset_time,
    'is_blocked', is_blocked
  );
  
  RETURN result;
END;
$$;

-- 5. Server-Side Authentication Event Logging Trigger
CREATE OR REPLACE FUNCTION public.log_auth_event_secure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  event_type text;
  user_company_id uuid;
BEGIN
  -- Determine event type based on trigger event
  CASE TG_OP
    WHEN 'INSERT' THEN event_type := 'USER_CREATED';
    WHEN 'UPDATE' THEN 
      IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
        event_type := 'USER_SIGNED_IN';
      ELSIF NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at AND NEW.email_confirmed_at IS NOT NULL THEN
        event_type := 'EMAIL_CONFIRMED';
      ELSE
        event_type := 'USER_UPDATED';
      END IF;
    ELSE
      RETURN NEW;
  END CASE;
  
  -- Get user's company ID for context
  SELECT company_id INTO user_company_id
  FROM public.profiles
  WHERE id = NEW.id;
  
  -- Log the authentication event
  INSERT INTO public.security_audit_log (
    user_id,
    company_id,
    action,
    resource_type,
    details
  ) VALUES (
    NEW.id,
    user_company_id,
    event_type,
    'authentication',
    jsonb_build_object(
      'email', NEW.email,
      'provider', COALESCE(NEW.app_metadata ->> 'provider', 'email'),
      'confirmed', NEW.email_confirmed_at IS NOT NULL,
      'last_sign_in', NEW.last_sign_in_at,
      'timestamp', NOW()
    )
  );
  
  RETURN NEW;
END;
$$;

-- Apply the authentication logging trigger
DROP TRIGGER IF EXISTS auth_event_logger ON auth.users;
CREATE TRIGGER auth_event_logger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_auth_event_secure();

-- 6. Apply enhanced profile security trigger
DROP TRIGGER IF EXISTS profile_security_enhanced ON public.profiles;
CREATE TRIGGER profile_security_enhanced
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_security_complete();