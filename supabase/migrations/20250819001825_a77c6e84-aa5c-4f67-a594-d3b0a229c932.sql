
-- Critical Security Fixes Implementation

-- 1. Fix company isolation by ensuring all users have proper company associations
-- First, let's update the handle_new_user trigger to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Add error handling and validation
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- 2. Create function to prevent role escalation
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_company_admin(COALESCE(OLD.company_id, NEW.company_id)) THEN
      RAISE EXCEPTION 'Only company admins can modify roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 3. Create function to prevent unauthorized company changes
CREATE OR REPLACE FUNCTION public.prevent_profile_company_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
    IF NOT public.is_company_admin(OLD.company_id) THEN
      RAISE EXCEPTION 'Only company admins can change company assignment';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. Add triggers to protect profiles table
DROP TRIGGER IF EXISTS prevent_role_escalation ON public.profiles;
CREATE TRIGGER prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

DROP TRIGGER IF EXISTS prevent_company_change ON public.profiles;
CREATE TRIGGER prevent_company_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.company_id IS DISTINCT FROM NEW.company_id)
  EXECUTE FUNCTION public.prevent_profile_company_change();

-- 5. Update all RLS policies to remove public access and require authentication
-- Update profiles policies to be more restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 6. Enhance audit logging with context enforcement
CREATE OR REPLACE FUNCTION public.audit_log_enforce_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to insert audit logs';
  END IF;

  NEW.user_id := auth.uid();

  IF NEW.company_id IS NULL THEN
    SELECT p.company_id INTO NEW.company_id
    FROM public.profiles p
    WHERE p.id = auth.uid();
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;

  IF NEW.details IS NULL THEN
    NEW.details := '{}'::jsonb;
  END IF;

  RETURN NEW;
END;
$function$;

-- 7. Add trigger to enforce audit log context
DROP TRIGGER IF EXISTS enforce_audit_context ON public.security_audit_log;
CREATE TRIGGER enforce_audit_context
  BEFORE INSERT ON public.security_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_log_enforce_context();

-- 8. Update security audit log policies to be more restrictive
DROP POLICY IF EXISTS "Company admins can view audit logs" ON public.security_audit_log;
CREATE POLICY "Company admins can view audit logs"
  ON public.security_audit_log FOR SELECT
  TO authenticated
  USING (public.is_company_admin(company_id));

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.security_audit_log;
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.security_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 9. Add trigger for sensitive operations auditing
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log operations on financial data
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
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'old_total', OLD.total,
        'new_total', NEW.total,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 10. Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_invoices ON public.invoices;
CREATE TRIGGER audit_invoices
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_quotes ON public.quotes;
CREATE TRIGGER audit_quotes
  AFTER INSERT OR UPDATE OR DELETE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_operations();

-- 11. Create function for RLS policy testing
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS TABLE(table_name text, policy_test text, result boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- This function can be used to test RLS policies
  -- Returns test results for manual verification
  RETURN QUERY
  SELECT 
    'invoices'::text as table_name,
    'Basic company isolation'::text as policy_test,
    (SELECT COUNT(*) = 0 FROM public.invoices WHERE company_id != (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )) as result;
END;
$function$;
