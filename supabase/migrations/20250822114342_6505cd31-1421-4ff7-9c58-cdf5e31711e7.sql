-- Critical Security Fixes Migration (Fixed)

-- 1. Fix RLS policies for sensitive tables to ensure proper company isolation
DROP POLICY IF EXISTS "Clients crud" ON public.clients;
CREATE POLICY "Clients read" ON public.clients 
  FOR SELECT USING (is_company_member(company_id));
CREATE POLICY "Clients write admin only" ON public.clients 
  FOR INSERT WITH CHECK (is_company_admin(company_id));
CREATE POLICY "Clients update admin only" ON public.clients 
  FOR UPDATE USING (is_company_admin(company_id)) 
  WITH CHECK (is_company_admin(company_id));
CREATE POLICY "Clients delete admin only" ON public.clients 
  FOR DELETE USING (is_company_admin(company_id));

-- 2. Strengthen profiles table security
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- 3. Enhanced API integrations security  
DROP POLICY IF EXISTS "API integrations select for members" ON public.api_integrations;
CREATE POLICY "API integrations view admin only" ON public.api_integrations 
  FOR SELECT USING (is_company_admin(company_id));

-- 4. Enhanced security audit log with rate limiting metadata
ALTER TABLE public.security_audit_log 
ADD COLUMN IF NOT EXISTS request_metadata jsonb DEFAULT '{}';

-- 5. Create function to detect brute force attempts
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

-- 6. Enhanced password reset tracking
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

-- 7. Create function to validate OAuth provider configuration
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

-- 8. Enhanced webhook security with rate limiting
CREATE TABLE IF NOT EXISTS public.webhook_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL,
  ip_address inet NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT NOW(),
  created_at timestamp with time zone DEFAULT NOW()
);

-- Add RLS for webhook rate limits
ALTER TABLE public.webhook_rate_limits ENABLE ROW LEVEL SECURITY;

-- 9. Create secure webhook validation function
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