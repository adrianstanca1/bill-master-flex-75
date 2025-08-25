-- Fix Security Linter Warnings: Set search_path for functions

-- Fix search_path for newly created functions
CREATE OR REPLACE FUNCTION public.validate_company_isolation()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure all data modifications maintain company isolation
  IF TG_TABLE_NAME IN ('invoices', 'quotes', 'projects', 'clients', 'expenses') THEN
    IF NEW.company_id IS NULL THEN
      RAISE EXCEPTION 'Company ID is required for data isolation';
    END IF;
    
    -- Verify user belongs to the company they're trying to access
    IF NOT public.is_company_member(NEW.company_id) THEN
      -- Log security violation
      INSERT INTO public.security_audit_log (
        user_id, company_id, action, resource_type, resource_id, details
      ) VALUES (
        auth.uid(), NEW.company_id, 'SECURITY_VIOLATION', 
        'UNAUTHORIZED_COMPANY_ACCESS', NEW.id,
        jsonb_build_object(
          'table', TG_TABLE_NAME,
          'attempted_company_id', NEW.company_id,
          'timestamp', now()
        )
      );
      RAISE EXCEPTION 'Unauthorized access to company data';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.detect_security_threats()
RETURNS TRIGGER AS $$
DECLARE
  threat_score INTEGER := 0;
  user_company_id UUID;
BEGIN
  -- Get user's company
  SELECT p.company_id INTO user_company_id
  FROM public.profiles p
  WHERE p.id = auth.uid();
  
  -- Check for suspicious patterns
  IF NEW.action IN ('SECURITY_VIOLATION', 'UNAUTHORIZED_ACCESS') THEN
    threat_score := threat_score + 10;
  END IF;
  
  -- Check for multiple failed attempts
  IF EXISTS (
    SELECT 1 FROM public.security_audit_log sal
    WHERE sal.user_id = auth.uid()
      AND sal.action LIKE '%FAILED%'
      AND sal.created_at > NOW() - INTERVAL '1 hour'
    HAVING COUNT(*) > 5
  ) THEN
    threat_score := threat_score + 20;
  END IF;
  
  -- Auto-alert for high threat scores
  IF threat_score >= 20 THEN
    INSERT INTO public.security_events (
      event_type, severity, user_id, details
    ) VALUES (
      'HIGH_THREAT_DETECTED',
      'critical',
      auth.uid(),
      jsonb_build_object(
        'threat_score', threat_score,
        'company_id', user_company_id,
        'last_action', NEW.action,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.enhanced_brute_force_check(
  check_user_id UUID,
  check_ip INET DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  user_failures INTEGER;
  ip_failures INTEGER;
  result JSONB;
BEGIN
  -- Count user failures in last 15 minutes
  SELECT COUNT(*) INTO user_failures
  FROM public.security_audit_log sal
  WHERE sal.user_id = check_user_id
    AND sal.action IN ('LOGIN_FAILED', 'PASSWORD_RESET_FAILED', 'UNAUTHORIZED_ACCESS')
    AND sal.created_at > NOW() - INTERVAL '15 minutes';
    
  -- Count IP failures if provided
  user_failures := 0;
  IF check_ip IS NOT NULL THEN
    SELECT COUNT(*) INTO ip_failures
    FROM public.security_audit_log sal
    WHERE sal.ip_address = check_ip
      AND sal.action IN ('LOGIN_FAILED', 'PASSWORD_RESET_FAILED', 'UNAUTHORIZED_ACCESS')
      AND sal.created_at > NOW() - INTERVAL '1 hour';
  END IF;
  
  result := jsonb_build_object(
    'user_failures', user_failures,
    'ip_failures', ip_failures,
    'user_blocked', user_failures >= 5,
    'ip_blocked', ip_failures >= 10,
    'block_expires_at', CASE 
      WHEN user_failures >= 5 OR ip_failures >= 10 
      THEN NOW() + INTERVAL '1 hour'
      ELSE NULL
    END
  );
  
  -- Log if blocking
  IF user_failures >= 5 OR ip_failures >= 10 THEN
    INSERT INTO public.security_events (
      event_type, severity, user_id, ip_address, details
    ) VALUES (
      'BRUTE_FORCE_DETECTED',
      'high',
      check_user_id,
      check_ip,
      result
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';