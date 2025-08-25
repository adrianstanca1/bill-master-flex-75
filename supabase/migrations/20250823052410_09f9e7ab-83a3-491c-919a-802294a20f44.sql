-- Phase 1: Critical Authentication Fixes

-- 1. Fix OAuth State Token Exposure - Remove public access
DROP POLICY IF EXISTS "OAuth state tokens are public for validation" ON public.oauth_state_store;

-- Create secure server-side OAuth state validation function
CREATE OR REPLACE FUNCTION public.validate_oauth_state_secure(token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  valid_token RECORD;
  result jsonb;
BEGIN
  -- Find and validate token
  SELECT * INTO valid_token 
  FROM public.oauth_state_store 
  WHERE state_token = token 
    AND expires_at > now() 
    AND NOT used;
  
  IF valid_token.id IS NOT NULL THEN
    -- Mark token as used
    UPDATE public.oauth_state_store 
    SET used = true, updated_at = now()
    WHERE id = valid_token.id;
    
    result := jsonb_build_object(
      'valid', true,
      'token_id', valid_token.id,
      'session_id', valid_token.user_session_id
    );
  ELSE
    result := jsonb_build_object('valid', false);
  END IF;
  
  -- Log validation attempt for security monitoring
  INSERT INTO public.security_audit_log (
    action,
    resource_type,
    details
  ) VALUES (
    CASE WHEN valid_token.id IS NOT NULL THEN 'OAUTH_STATE_VALIDATED' ELSE 'OAUTH_STATE_INVALID' END,
    'oauth_security',
    jsonb_build_object(
      'token_provided', token IS NOT NULL,
      'token_valid', valid_token.id IS NOT NULL,
      'ip_address', current_setting('request.headers', true)::json ->> 'x-forwarded-for',
      'timestamp', now()
    )
  );
  
  RETURN result;
END;
$function$;

-- 2. Enhanced Password Security Function
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  score INTEGER := 0;
  feedback TEXT[] := '{}';
  result jsonb;
BEGIN
  -- Length check
  IF length(password) >= 8 THEN
    score := score + 2;
  ELSE
    feedback := array_append(feedback, 'Password must be at least 8 characters long');
  END IF;
  
  -- Uppercase check
  IF password ~ '[A-Z]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Include at least one uppercase letter');
  END IF;
  
  -- Lowercase check
  IF password ~ '[a-z]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Include at least one lowercase letter');
  END IF;
  
  -- Number check
  IF password ~ '[0-9]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Include at least one number');
  END IF;
  
  -- Special character check
  IF password ~ '[!@#$%^&*(),.?":{}|<>]' THEN
    score := score + 1;
  ELSE
    feedback := array_append(feedback, 'Include at least one special character');
  END IF;
  
  -- Common password patterns (basic check)
  IF password ~* '(password|123456|qwerty|admin|letmein)' THEN
    score := score - 2;
    feedback := array_append(feedback, 'Avoid common passwords');
  END IF;
  
  result := jsonb_build_object(
    'score', score,
    'max_score', 6,
    'is_strong', score >= 4,
    'feedback', feedback,
    'strength', CASE 
      WHEN score >= 5 THEN 'very_strong'
      WHEN score >= 4 THEN 'strong'
      WHEN score >= 2 THEN 'medium'
      ELSE 'weak'
    END
  );
  
  RETURN result;
END;
$function$;

-- 3. Enhanced Rate Limiting Function
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  identifier text,
  action_type text,
  max_attempts integer DEFAULT 5,
  time_window interval DEFAULT '00:15:00'::interval,
  block_duration interval DEFAULT '01:00:00'::interval
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  attempt_count integer;
  last_attempt timestamp with time zone;
  is_blocked boolean := false;
  reset_time timestamp with time zone;
  result jsonb;
BEGIN
  -- Count recent attempts
  SELECT COUNT(*), MAX(created_at) INTO attempt_count, last_attempt
  FROM public.security_audit_log
  WHERE details ->> 'identifier' = identifier
    AND action = action_type
    AND created_at > NOW() - time_window;
    
  -- Check if currently blocked
  IF attempt_count >= max_attempts THEN
    is_blocked := true;
    reset_time := last_attempt + block_duration;
    
    -- Check if block has expired
    IF reset_time <= NOW() THEN
      is_blocked := false;
      -- Clean old attempts
      DELETE FROM public.security_audit_log
      WHERE details ->> 'identifier' = identifier
        AND action = action_type
        AND created_at < NOW() - time_window;
      attempt_count := 0;
    END IF;
  END IF;
  
  -- Log this check
  INSERT INTO public.security_audit_log (
    action,
    resource_type,
    details
  ) VALUES (
    'RATE_LIMIT_CHECK',
    'rate_limiting',
    jsonb_build_object(
      'identifier', identifier,
      'action_type', action_type,
      'attempt_count', attempt_count,
      'max_attempts', max_attempts,
      'is_blocked', is_blocked,
      'timestamp', now()
    )
  );
  
  result := jsonb_build_object(
    'allowed', NOT is_blocked,
    'attempts_remaining', GREATEST(0, max_attempts - attempt_count),
    'reset_time', reset_time,
    'is_blocked', is_blocked,
    'block_expires_at', CASE WHEN is_blocked THEN reset_time ELSE NULL END
  );
  
  RETURN result;
END;
$function$;

-- 4. Secure Session Validation Function
CREATE OR REPLACE FUNCTION public.validate_session_security_enhanced()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result jsonb := '{}';
  user_profile record;
  session_age interval;
  suspicious_activity boolean := false;
BEGIN
  -- Check if user exists and has valid company association
  SELECT * INTO user_profile FROM public.profiles WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    result := jsonb_build_object(
      'valid', false,
      'reason', 'User profile not found',
      'requires_reauth', true
    );
    RETURN result;
  END IF;
  
  -- Check for suspicious activity patterns
  SELECT EXISTS (
    SELECT 1 FROM public.security_audit_log
    WHERE user_id = auth.uid()
      AND action IN ('SECURITY_VIOLATION', 'UNAUTHORIZED_ACCESS', 'CONCURRENT_SESSION_DETECTED')
      AND created_at > NOW() - INTERVAL '1 hour'
  ) INTO suspicious_activity;
  
  -- Check session age
  session_age := NOW() - (auth.jwt() ->> 'iat')::bigint::timestamp;
  
  -- Enhanced validation logic
  IF session_age > '8 hours'::interval THEN
    result := jsonb_build_object(
      'valid', false,
      'reason', 'Session expired - refresh required',
      'requires_reauth', true
    );
  ELSIF suspicious_activity THEN
    result := jsonb_build_object(
      'valid', false,
      'reason', 'Suspicious activity detected',
      'requires_reauth', true
    );
  ELSIF user_profile.company_id IS NULL THEN
    result := jsonb_build_object(
      'valid', true,
      'requires_setup', true,
      'user_id', user_profile.id,
      'company_id', null,
      'role', user_profile.role
    );
  ELSE
    result := jsonb_build_object(
      'valid', true,
      'user_id', user_profile.id,
      'company_id', user_profile.company_id,
      'role', user_profile.role,
      'enhanced_role', user_profile.enhanced_role,
      'session_age_hours', EXTRACT(EPOCH FROM session_age) / 3600,
      'security_score', CASE 
        WHEN suspicious_activity THEN 0
        WHEN session_age > '4 hours'::interval THEN 70
        ELSE 100
      END
    );
  END IF;
  
  -- Log session validation
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    details
  ) VALUES (
    auth.uid(),
    'SESSION_VALIDATION',
    'session_security',
    jsonb_build_object(
      'session_age_hours', EXTRACT(EPOCH FROM session_age) / 3600,
      'suspicious_activity', suspicious_activity,
      'company_id', user_profile.company_id,
      'validation_result', result -> 'valid',
      'timestamp', now()
    )
  );
  
  RETURN result;
END;
$function$;

-- 5. Enhanced Input Sanitization with Threat Detection
CREATE OR REPLACE FUNCTION public.sanitize_input_enhanced(input_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  sanitized_text text;
  threat_level integer := 0;
  threats_detected text[] := '{}';
  result jsonb;
BEGIN
  sanitized_text := input_text;
  
  -- SQL Injection patterns
  IF input_text ~* '(union|select|insert|update|delete|drop|exec|script)[\s\(]' THEN
    threat_level := threat_level + 5;
    threats_detected := array_append(threats_detected, 'sql_injection_attempt');
  END IF;
  
  -- XSS patterns
  IF input_text ~* '<script[^>]*>|javascript:|data:text/html|vbscript:|onload=|onerror=' THEN
    threat_level := threat_level + 4;
    threats_detected := array_append(threats_detected, 'xss_attempt');
    sanitized_text := regexp_replace(sanitized_text, '<script[^>]*>.*?</script>', '', 'gi');
    sanitized_text := regexp_replace(sanitized_text, 'javascript:', '', 'gi');
    sanitized_text := regexp_replace(sanitized_text, 'data:text/html', '', 'gi');
    sanitized_text := regexp_replace(sanitized_text, 'vbscript:', '', 'gi');
    sanitized_text := regexp_replace(sanitized_text, 'on\w+\s*=', '', 'gi');
  END IF;
  
  -- Command injection patterns
  IF input_text ~* '(\||&|;|`|\$\(|>\s*&)' THEN
    threat_level := threat_level + 3;
    threats_detected := array_append(threats_detected, 'command_injection_attempt');
  END IF;
  
  -- Path traversal patterns
  IF input_text ~* '\.\.\/|\.\.\\|%2e%2e%2f' THEN
    threat_level := threat_level + 3;
    threats_detected := array_append(threats_detected, 'path_traversal_attempt');
  END IF;
  
  -- Log high-threat inputs
  IF threat_level >= 4 THEN
    INSERT INTO public.security_events (
      event_type,
      severity,
      user_id,
      details
    ) VALUES (
      'HIGH_THREAT_INPUT_DETECTED',
      'high',
      auth.uid(),
      jsonb_build_object(
        'threat_level', threat_level,
        'threats_detected', threats_detected,
        'original_input_length', length(input_text),
        'sanitized_input_length', length(sanitized_text),
        'timestamp', now()
      )
    );
  END IF;
  
  result := jsonb_build_object(
    'sanitized_text', sanitized_text,
    'threat_level', threat_level,
    'threats_detected', threats_detected,
    'is_safe', threat_level < 3,
    'requires_review', threat_level >= 4
  );
  
  RETURN result;
END;
$function$;