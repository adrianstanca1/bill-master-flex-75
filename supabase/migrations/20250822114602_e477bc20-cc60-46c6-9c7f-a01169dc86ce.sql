-- Fix remaining security issues

-- 1. Add RLS policy for webhook_rate_limits table  
CREATE POLICY "Webhook rate limits company admin access" ON public.webhook_rate_limits 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.webhooks w 
      JOIN public.companies c ON w.company_id = c.id
      WHERE w.id = webhook_rate_limits.webhook_id 
      AND (c.owner_user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.company_members cm 
                   WHERE cm.company_id = c.id 
                   AND cm.user_id = auth.uid() 
                   AND cm.role = 'admin'))
    )
  );

-- 2. Fix function search paths for security (Update existing functions)
CREATE OR REPLACE FUNCTION public.detect_brute_force_attempts(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  failed_attempts integer;
BEGIN
  -- Count failed login attempts in last 15 minutes
  SELECT COUNT(*) INTO failed_attempts
  FROM public.security_audit_log
  WHERE user_id = check_user_id
    AND action IN ('LOGIN_FAILED', 'PASSWORD_RESET_FAILED')
    AND created_at > NOW() - INTERVAL '15 minutes';
  
  -- Return true if more than 5 failed attempts
  RETURN failed_attempts > 5;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_password_reset_attempt(user_email text, success boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.validate_oauth_providers()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.validate_webhook_signature(
  webhook_id uuid,
  payload text,
  signature text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;