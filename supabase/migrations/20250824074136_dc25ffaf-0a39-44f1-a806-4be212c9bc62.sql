-- Fix RLS policies for enhanced security

-- 1. Prevent users from updating their own company_id in profiles table
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent company_id changes after initial creation
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- 2. Add rate limiting to security_audit_log
DROP POLICY IF EXISTS "System can insert security logs" ON public.security_audit_log;

CREATE POLICY "System can insert security logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (
  -- Allow system inserts but add basic rate limiting
  (user_id IS NULL OR user_id = auth.uid()) AND
  -- Prevent too many logs from same user in short time (basic protection)
  (
    SELECT COUNT(*) 
    FROM public.security_audit_log 
    WHERE user_id = NEW.user_id 
    AND created_at > now() - INTERVAL '1 minute'
  ) < 10
);

-- 3. Improve database function security
CREATE OR REPLACE FUNCTION public.secure_store_data(store_key text, store_value jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Input validation
  IF store_key IS NULL OR LENGTH(store_key) = 0 OR LENGTH(store_key) > 100 THEN
    RAISE EXCEPTION 'Invalid store key';
  END IF;
  
  IF store_value IS NULL THEN
    RAISE EXCEPTION 'Store value cannot be null';
  END IF;

  INSERT INTO security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    'SECURE_STORE',
    'secure_storage',
    store_key,
    jsonb_build_object('key', store_key, 'value', store_value, 'timestamp', now())
  );
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error without exposing details
    INSERT INTO security_audit_log (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'SECURE_STORE_ERROR',
      'secure_storage',
      'error',
      jsonb_build_object('error', 'Storage operation failed', 'timestamp', now())
    );
    RETURN FALSE;
END;
$function$;

-- 4. Enhanced brute force protection with better validation
CREATE OR REPLACE FUNCTION public.enhanced_brute_force_check(check_user_id uuid DEFAULT NULL::uuid, check_ip inet DEFAULT NULL::inet)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_failures INTEGER := 0;
  ip_failures INTEGER := 0;
  user_blocked BOOLEAN := FALSE;
  ip_blocked BOOLEAN := FALSE;
  block_expires_at TIMESTAMP WITH TIME ZONE := NULL;
BEGIN
  -- Input validation
  IF check_user_id IS NULL AND check_ip IS NULL THEN
    RAISE EXCEPTION 'Either user_id or ip must be provided';
  END IF;

  -- Check user failures in last hour
  IF check_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO user_failures
    FROM security_audit_log
    WHERE user_id = check_user_id
      AND action LIKE '%FAILED%'
      AND created_at > now() - INTERVAL '1 hour';
    
    user_blocked := user_failures >= 5;
  END IF;
  
  -- Check IP failures (would need server-side implementation)
  IF check_ip IS NOT NULL THEN
    SELECT COUNT(*) INTO ip_failures
    FROM security_audit_log
    WHERE ip_address = check_ip
      AND action LIKE '%FAILED%'
      AND created_at > now() - INTERVAL '1 hour';
    
    ip_blocked := ip_failures >= 10;
  END IF;
  
  -- Calculate block expiry with progressive penalties
  IF user_blocked OR ip_blocked THEN
    -- Progressive blocking: 30 min for first offense, 1 hour for repeat offenses
    IF user_failures > 10 OR ip_failures > 20 THEN
      block_expires_at := now() + INTERVAL '1 hour';
    ELSE
      block_expires_at := now() + INTERVAL '30 minutes';
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'user_blocked', user_blocked,
    'ip_blocked', ip_blocked,
    'block_expires_at', block_expires_at,
    'user_failures', user_failures,
    'ip_failures', ip_failures
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return safe default on error
    RETURN jsonb_build_object(
      'user_blocked', false,
      'ip_blocked', false,
      'block_expires_at', null,
      'user_failures', 0,
      'ip_failures', 0,
      'error', 'Security check failed'
    );
END;
$function$;