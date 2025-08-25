-- Priority 1: Fix Critical RLS Policies and Company Association Security

-- Fix profiles table to allow temporary NULL company_id during setup
ALTER TABLE public.profiles ALTER COLUMN company_id DROP NOT NULL;

-- Add security validation trigger for profiles
CREATE OR REPLACE FUNCTION public.validate_profile_security_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- For existing users, ensure company_id changes are properly authorized
  IF TG_OP = 'UPDATE' AND NEW.company_id IS DISTINCT FROM OLD.company_id THEN
    -- Only allow company changes if user is admin of old company or if old company was null
    IF OLD.company_id IS NOT NULL AND NOT (
      SELECT public.is_company_admin(OLD.company_id)
    ) THEN
      RAISE EXCEPTION 'Unauthorized company assignment change';
    END IF;
    
    -- Log security event for company changes
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource_type,
      details
    ) VALUES (
      auth.uid(),
      'COMPANY_ASSIGNMENT_CHANGED',
      'profile_security',
      jsonb_build_object(
        'old_company_id', OLD.company_id,
        'new_company_id', NEW.company_id,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the enhanced security trigger to profiles
DROP TRIGGER IF EXISTS validate_profile_security_trigger ON public.profiles;
CREATE TRIGGER validate_profile_security_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_security_enhanced();

-- Strengthen RLS policies for sensitive tables
-- Update profiles policies to handle NULL company_id safely
DROP POLICY IF EXISTS "Company admins can view company profiles" ON public.profiles;
CREATE POLICY "Company admins can view company profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) AND 
  (company_id IS NOT NULL) AND 
  is_company_admin(company_id)
);

-- Add policy for users with no company (setup phase)
CREATE POLICY "Users without company can view own profile" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() = id) AND 
  (company_id IS NULL)
);

-- Restrict security audit log access to admin users only
DROP POLICY IF EXISTS "Company admins can view audit logs" ON public.security_audit_log;
CREATE POLICY "Admin users can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin' 
    AND p.company_id IS NOT NULL
  )
);

-- Restrict security events to admin access only
DROP POLICY IF EXISTS "Security events company admin view" ON public.security_events;
CREATE POLICY "Admin users can view security events" 
ON public.security_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin' 
    AND p.company_id IS NOT NULL
  )
);

-- Add enhanced validation function for security context
CREATE OR REPLACE FUNCTION public.validate_security_context_enhanced()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_profile RECORD;
  violations TEXT[] := '{}';
  result JSONB;
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    violations := array_append(violations, 'User not authenticated');
    RETURN jsonb_build_object(
      'is_valid', false,
      'violations', violations,
      'user_id', null,
      'company_id', null
    );
  END IF;
  
  -- Check user has valid profile
  SELECT * INTO user_profile
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    violations := array_append(violations, 'User profile not found');
  ELSE
    -- Allow temporary NULL company_id for setup process
    IF user_profile.company_id IS NULL THEN
      violations := array_append(violations, 'User has no company association - setup required');
      
      -- Log this as a security event for monitoring
      INSERT INTO public.security_audit_log (
        user_id,
        action,
        resource_type,
        details
      ) VALUES (
        auth.uid(),
        'NO_COMPANY_ASSOCIATION',
        'security_validation',
        jsonb_build_object(
          'timestamp', now(),
          'requires_setup', true,
          'user_role', user_profile.role
        )
      );
    END IF;
  END IF;
  
  result := jsonb_build_object(
    'is_valid', array_length(violations, 1) IS NULL,
    'violations', violations,
    'user_id', auth.uid(),
    'company_id', COALESCE(user_profile.company_id, null),
    'user_role', COALESCE(user_profile.role, null)
  );
  
  RETURN result;
END;
$$;

-- Add function to check if user can perform sensitive operations
CREATE OR REPLACE FUNCTION public.can_perform_sensitive_operation()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Must have company association
  SELECT * INTO user_profile
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF NOT FOUND OR user_profile.company_id IS NULL THEN
    -- Log security violation
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource_type,
      details
    ) VALUES (
      auth.uid(),
      'SECURITY_VIOLATION',
      'sensitive_operation_blocked',
      jsonb_build_object(
        'violation_type', 'NO_COMPANY_ASSOCIATION',
        'timestamp', now()
      )
    );
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Add enhanced trigger for sensitive financial operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Block operations if user doesn't have proper company association
  IF NOT public.can_perform_sensitive_operation() THEN
    RAISE EXCEPTION 'Cannot perform sensitive operation without proper company association';
  END IF;
  
  -- Log operations on financial data with enhanced details
  IF TG_TABLE_NAME IN ('invoices', 'quotes', 'expenses', 'retentions') THEN
    INSERT INTO public.security_audit_log (
      user_id, 
      company_id, 
      action, 
      resource_type, 
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      COALESCE(NEW.company_id, OLD.company_id),
      TG_OP || '_' || upper(TG_TABLE_NAME),
      'financial_data',
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'old_total', CASE WHEN OLD IS NOT NULL THEN OLD.total ELSE NULL END,
        'new_total', CASE WHEN NEW IS NOT NULL THEN NEW.total ELSE NULL END,
        'timestamp', now(),
        'operation_type', TG_OP
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply enhanced audit trigger to financial tables
DROP TRIGGER IF EXISTS audit_sensitive_operations_trigger ON public.invoices;
CREATE TRIGGER audit_sensitive_operations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations_enhanced();

DROP TRIGGER IF EXISTS audit_sensitive_operations_trigger ON public.quotes;
CREATE TRIGGER audit_sensitive_operations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations_enhanced();

DROP TRIGGER IF EXISTS audit_sensitive_operations_trigger ON public.expenses;
CREATE TRIGGER audit_sensitive_operations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations_enhanced();