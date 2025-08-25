-- Security fix: Update database functions to use secure search_path

-- Fix: validate_oauth_providers function
CREATE OR REPLACE FUNCTION public.validate_oauth_providers()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result jsonb := '{}';
BEGIN
  -- This would be called from the frontend to check OAuth status
  result := jsonb_build_object(
    'google_enabled', false,
    'microsoft_enabled', false,
    'recommendation', 'Configure OAuth providers in Supabase Auth settings or remove OAuth buttons'
  );
  
  RETURN result;
END;
$function$;

-- Fix: validate_csrf_token function
CREATE OR REPLACE FUNCTION public.validate_csrf_token(token text, expected text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Simple CSRF token validation
  RETURN token = expected AND LENGTH(token) >= 32;
END;
$function$;

-- Fix: check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(user_identifier text, action_type text, max_attempts integer DEFAULT 5, time_window interval DEFAULT '01:00:00'::interval)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  attempt_count integer;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*) INTO attempt_count
  FROM public.security_audit_log
  WHERE details ->> 'user_identifier' = user_identifier
    AND action = action_type
    AND created_at > NOW() - time_window;
    
  RETURN attempt_count < max_attempts;
END;
$function$;

-- Fix: log_password_reset_attempt function
CREATE OR REPLACE FUNCTION public.log_password_reset_attempt(user_email text, success boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    details
  ) VALUES (
    auth.uid(),
    CASE WHEN success THEN 'PASSWORD_RESET_SUCCESS' ELSE 'PASSWORD_RESET_FAILED' END,
    'authentication',
    jsonb_build_object(
      'email', user_email,
      'timestamp', NOW(),
      'ip_address', current_setting('request.headers', true)::json ->> 'x-forwarded-for'
    )
  );
END;
$function$;

-- Fix: validate_webhook_signature function
CREATE OR REPLACE FUNCTION public.validate_webhook_signature(webhook_id uuid, payload text, signature text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  secret_data record;
  expected_signature text;
BEGIN
  -- Get webhook secret (admin only access enforced by RLS)
  SELECT encrypted_secret INTO secret_data
  FROM public.webhook_secrets ws
  WHERE ws.webhook_id = validate_webhook_signature.webhook_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Validate HMAC-SHA256 signature
  expected_signature := encode(
    hmac(payload, decode(secret_data.encrypted_secret, 'base64'), 'sha256'),
    'hex'
  );
  
  RETURN ('sha256=' || expected_signature) = signature;
END;
$function$;