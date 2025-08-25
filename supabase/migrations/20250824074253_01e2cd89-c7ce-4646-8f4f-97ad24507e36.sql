-- Fix security warnings from linter

-- 1. Fix function search path for secure_store_data
CREATE OR REPLACE FUNCTION public.secure_store_data(store_key text, store_value jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Fix: Set specific search path
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

-- 2. Fix function search path for secure_retrieve_data
CREATE OR REPLACE FUNCTION public.secure_retrieve_data(store_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Fix: Set specific search path
AS $function$
DECLARE
  result JSONB;
BEGIN
  -- Input validation
  IF store_key IS NULL OR LENGTH(store_key) = 0 OR LENGTH(store_key) > 100 THEN
    RAISE EXCEPTION 'Invalid store key';
  END IF;

  SELECT details->'value' INTO result
  FROM security_audit_log
  WHERE user_id = auth.uid()
    AND action = 'SECURE_STORE'
    AND resource_id = store_key
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$function$;

-- 3. Fix function search path for enhanced_brute_force_check
CREATE OR REPLACE FUNCTION public.enhanced_brute_force_check(check_user_id uuid DEFAULT NULL::uuid, check_ip inet DEFAULT NULL::inet)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Fix: Set specific search path
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