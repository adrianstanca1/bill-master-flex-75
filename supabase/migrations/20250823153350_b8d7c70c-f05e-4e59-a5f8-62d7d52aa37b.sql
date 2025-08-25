-- Fix critical RLS policy over-permissions
-- 1. Restrict clients table access to admins/managers only
DROP POLICY IF EXISTS "Clients role-based access control" ON public.clients;
CREATE POLICY "Clients admin manager only access" 
ON public.clients 
FOR ALL
USING (is_company_member(company_id) AND is_admin_or_manager(auth.uid()))
WITH CHECK (is_company_member(company_id) AND is_admin_or_manager(auth.uid()));

-- 2. Restrict profiles table viewing to user themselves + company admins only
DROP POLICY IF EXISTS "Company admins can view company profiles" ON public.profiles;
CREATE POLICY "Profiles restricted access" 
ON public.profiles 
FOR SELECT
USING (
  (auth.uid() = id) OR 
  (company_id IS NOT NULL AND is_company_admin(company_id))
);

-- 3. Restrict expenses to managers/admins only (already correct, but ensuring consistency)
-- This policy is already correctly restrictive

-- 4. Restrict business analytics to admin/manager only (already correct)
-- This policy is already correctly restrictive

-- 5. Add missing OAuth state storage function
CREATE OR REPLACE FUNCTION public.store_oauth_state(
  state_token text,
  session_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  state_id uuid;
BEGIN
  -- Clean up expired tokens first
  DELETE FROM public.oauth_state_store 
  WHERE expires_at < now();
  
  -- Insert new state token
  INSERT INTO public.oauth_state_store (
    state_token,
    user_session_id,
    expires_at
  ) VALUES (
    state_token,
    session_id,
    now() + interval '10 minutes'
  ) RETURNING id INTO state_id;
  
  -- Log the state creation for security monitoring
  INSERT INTO public.security_audit_log (
    action,
    resource_type,
    details
  ) VALUES (
    'OAUTH_STATE_CREATED',
    'oauth_security',
    jsonb_build_object(
      'state_id', state_id,
      'expires_at', now() + interval '10 minutes',
      'timestamp', now()
    )
  );
  
  RETURN state_id;
END;
$function$;

-- 6. Enhanced server-side authentication logging triggers
CREATE OR REPLACE FUNCTION public.enhanced_auth_event_logger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Log all authentication state changes
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    details
  ) VALUES (
    NEW.id,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'USER_REGISTERED'
      WHEN TG_OP = 'UPDATE' AND OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN 'USER_SIGNED_IN'
      WHEN TG_OP = 'UPDATE' AND OLD.confirmed_at IS DISTINCT FROM NEW.confirmed_at THEN 'EMAIL_CONFIRMED'
      ELSE 'USER_UPDATED'
    END,
    'authentication',
    jsonb_build_object(
      'email', NEW.email,
      'confirmed_at', NEW.confirmed_at,
      'last_sign_in_at', NEW.last_sign_in_at,
      'sign_in_count', COALESCE(NEW.raw_app_meta_data->>'sign_in_count', '0'),
      'timestamp', now()
    )
  );
  
  RETURN NEW;
END;
$function$;

-- Apply the enhanced auth logging trigger
DROP TRIGGER IF EXISTS enhanced_auth_events ON auth.users;
CREATE TRIGGER enhanced_auth_events
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_auth_event_logger();

-- 7. Add enhanced security validation for sensitive operations
CREATE OR REPLACE FUNCTION public.validate_sensitive_operation_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  user_profile RECORD;
  suspicious_activity INTEGER;
BEGIN
  -- Get user profile and check recent suspicious activity
  SELECT * INTO user_profile
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Count suspicious activities in last hour
  SELECT COUNT(*) INTO suspicious_activity
  FROM public.security_audit_log
  WHERE user_id = auth.uid()
    AND action IN ('SECURITY_VIOLATION', 'UNAUTHORIZED_ACCESS', 'BRUTE_FORCE_DETECTED')
    AND created_at > now() - interval '1 hour';
  
  -- Block operation if user has no company association (except during setup)
  IF user_profile.company_id IS NULL AND TG_TABLE_NAME NOT IN ('profiles', 'companies') THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource_type,
      details
    ) VALUES (
      auth.uid(),
      'SECURITY_VIOLATION',
      'operation_blocked',
      jsonb_build_object(
        'reason', 'NO_COMPANY_ASSOCIATION',
        'table', TG_TABLE_NAME,
        'timestamp', now()
      )
    );
    RAISE EXCEPTION 'Operation blocked: No company association';
  END IF;
  
  -- Block operation if too much suspicious activity
  IF suspicious_activity >= 3 THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource_type,
      details
    ) VALUES (
      auth.uid(),
      'SECURITY_VIOLATION',
      'operation_blocked',
      jsonb_build_object(
        'reason', 'SUSPICIOUS_ACTIVITY_DETECTED',
        'activity_count', suspicious_activity,
        'table', TG_TABLE_NAME,
        'timestamp', now()
      )
    );
    RAISE EXCEPTION 'Operation blocked: Suspicious activity detected';
  END IF;
  
  -- Log the operation for audit trail
  INSERT INTO public.security_audit_log (
    user_id,
    company_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    user_profile.company_id,
    'SENSITIVE_OPERATION_' || TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'user_role', user_profile.enhanced_role,
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Apply enhanced validation to sensitive tables
DROP TRIGGER IF EXISTS enhanced_invoices_security ON public.invoices;
CREATE TRIGGER enhanced_invoices_security
  BEFORE INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.validate_sensitive_operation_enhanced();

DROP TRIGGER IF EXISTS enhanced_quotes_security ON public.quotes;
CREATE TRIGGER enhanced_quotes_security
  BEFORE INSERT OR UPDATE OR DELETE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.validate_sensitive_operation_enhanced();

DROP TRIGGER IF EXISTS enhanced_expenses_security ON public.expenses;
CREATE TRIGGER enhanced_expenses_security
  BEFORE INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.validate_sensitive_operation_enhanced();

-- 8. Enhanced rate limiting for critical operations
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_validator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  operation_count INTEGER;
  rate_limit_result JSONB;
BEGIN
  -- Check rate limits for financial operations
  IF TG_TABLE_NAME IN ('invoices', 'quotes', 'expenses') THEN
    SELECT COUNT(*) INTO operation_count
    FROM public.security_audit_log
    WHERE user_id = auth.uid()
      AND action LIKE 'SENSITIVE_OPERATION_%'
      AND resource_type = TG_TABLE_NAME
      AND created_at > now() - interval '1 minute';
    
    -- Limit to 10 operations per minute for financial data
    IF operation_count >= 10 THEN
      INSERT INTO public.security_audit_log (
        user_id,
        action,
        resource_type,
        details
      ) VALUES (
        auth.uid(),
        'RATE_LIMIT_EXCEEDED',
        TG_TABLE_NAME,
        jsonb_build_object(
          'operation_count', operation_count,
          'time_window', '1 minute',
          'limit', 10,
          'timestamp', now()
        )
      );
      RAISE EXCEPTION 'Rate limit exceeded: Too many operations on % in the last minute', TG_TABLE_NAME;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Apply rate limiting to sensitive tables
DROP TRIGGER IF EXISTS rate_limit_invoices ON public.invoices;
CREATE TRIGGER rate_limit_invoices
  BEFORE INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_rate_limit_validator();

DROP TRIGGER IF EXISTS rate_limit_quotes ON public.quotes;
CREATE TRIGGER rate_limit_quotes
  BEFORE INSERT OR UPDATE OR DELETE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_rate_limit_validator();

DROP TRIGGER IF EXISTS rate_limit_expenses ON public.expenses;
CREATE TRIGGER rate_limit_expenses
  BEFORE INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_rate_limit_validator();