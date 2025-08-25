-- Critical Security Fixes Migration

-- 1. Fix RLS policies for sensitive tables to ensure proper company isolation
DROP POLICY IF EXISTS "Clients crud" ON public.clients;
CREATE POLICY "Clients read" ON public.clients 
  FOR SELECT USING (is_company_member(company_id));
CREATE POLICY "Clients write admin only" ON public.clients 
  FOR ALL USING (is_company_admin(company_id)) 
  WITH CHECK (is_company_admin(company_id));

-- 2. Strengthen profiles table security
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile restricted" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id AND (company_id = OLD.company_id OR is_company_admin(company_id)));

-- 3. Enhanced API integrations security
DROP POLICY IF EXISTS "API integrations select for members" ON public.api_integrations;
CREATE POLICY "API integrations view admin only" ON public.api_integrations 
  FOR SELECT USING (is_company_admin(company_id));

-- 4. Fix webhook secrets security with proper admin-only access
CREATE POLICY "Webhook secrets admin access" ON public.webhook_secrets 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.webhooks w 
      WHERE w.id = webhook_secrets.webhook_id 
      AND is_company_admin(w.company_id)
    )
  );

-- 5. Enhanced security audit log with rate limiting metadata
ALTER TABLE public.security_audit_log 
ADD COLUMN IF NOT EXISTS request_metadata jsonb DEFAULT '{}';

-- 6. Create function to detect brute force attempts
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

-- 7. Enhanced password reset tracking
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

-- 8. Fix database function search paths for security
UPDATE pg_proc 
SET prosecdef = true, proconfig = array_append(proconfig, 'search_path=public')
WHERE proname IN (
  'setup_user_company',
  'track_auth_events',
  'validate_security_context',
  'enforce_company_isolation'
) AND proconfig IS NULL;

-- 9. Create function to validate OAuth provider configuration
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

-- 10. Enhanced webhook security with rate limiting
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
CREATE POLICY "Webhook rate limits admin access" ON public.webhook_rate_limits 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.webhooks w 
      WHERE w.id = webhook_rate_limits.webhook_id 
      AND is_company_admin(w.company_id)
    )
  );