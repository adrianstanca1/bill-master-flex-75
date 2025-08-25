-- Security Enhancement Migration: Fix Critical RLS Policies and Add Security Constraints

-- 1. Fix Profiles RLS Policy - Current policy allows viewing any profile, should be restricted
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Add policy for company admins to view profiles in their company
CREATE POLICY "Company admins can view company profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  company_id IS NOT NULL AND
  is_company_admin(company_id)
);

-- 2. Fix Clients RLS Policies - Ensure proper company isolation
DROP POLICY IF EXISTS "Clients read" ON public.clients;
CREATE POLICY "Clients company view" 
ON public.clients 
FOR SELECT 
USING (is_company_member(company_id));

-- 3. Enhance User Secure Data policies with additional validation
CREATE POLICY "Secure data company isolation check" 
ON public.user_secure_data 
FOR ALL 
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.company_id IS NOT NULL
  )
)
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.company_id IS NOT NULL
  )
);

-- 4. Add database constraints to ensure company_id is always set for security isolation
ALTER TABLE public.profiles ALTER COLUMN company_id SET NOT NULL;

-- 5. Create enhanced security validation function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for company isolation validation
CREATE TRIGGER enforce_company_isolation_trigger
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.validate_company_isolation();

CREATE TRIGGER enforce_company_isolation_trigger
  BEFORE INSERT OR UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.validate_company_isolation();

CREATE TRIGGER enforce_company_isolation_trigger
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.validate_company_isolation();

CREATE TRIGGER enforce_company_isolation_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.validate_company_isolation();

CREATE TRIGGER enforce_company_isolation_trigger
  BEFORE INSERT OR UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.validate_company_isolation();

-- 7. Enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.detect_security_threats()
RETURNS TRIGGER AS $$
DECLARE
  threat_score INTEGER := 0;
  user_company_id UUID;
BEGIN
  -- Get user's company
  SELECT company_id INTO user_company_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Check for suspicious patterns
  IF NEW.action IN ('SECURITY_VIOLATION', 'UNAUTHORIZED_ACCESS') THEN
    threat_score := threat_score + 10;
  END IF;
  
  -- Check for multiple failed attempts
  IF EXISTS (
    SELECT 1 FROM public.security_audit_log
    WHERE user_id = auth.uid()
      AND action LIKE '%FAILED%'
      AND created_at > NOW() - INTERVAL '1 hour'
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger for threat detection
CREATE TRIGGER security_threat_detection_trigger
  AFTER INSERT ON public.security_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.detect_security_threats();

-- 9. Enhanced brute force protection
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
  FROM public.security_audit_log
  WHERE user_id = check_user_id
    AND action IN ('LOGIN_FAILED', 'PASSWORD_RESET_FAILED', 'UNAUTHORIZED_ACCESS')
    AND created_at > NOW() - INTERVAL '15 minutes';
    
  -- Count IP failures if provided
  ip_failures := 0;
  IF check_ip IS NOT NULL THEN
    SELECT COUNT(*) INTO ip_failures
    FROM public.security_audit_log
    WHERE ip_address = check_ip
      AND action IN ('LOGIN_FAILED', 'PASSWORD_RESET_FAILED', 'UNAUTHORIZED_ACCESS')
      AND created_at > NOW() - INTERVAL '1 hour';
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
$$ LANGUAGE plpgsql SECURITY DEFINER;