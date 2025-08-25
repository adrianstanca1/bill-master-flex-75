
-- Phase 1: Critical Security Fixes for Database Functions

-- 1. Secure the handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
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

-- 2. Secure all company member check functions with proper search_path
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.company_members m
      WHERE m.company_id = _company_id
        AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.company_members m
      WHERE m.company_id = _company_id
        AND m.user_id = auth.uid()
        AND m.role = 'admin'
    )
  );
$function$;

-- 3. Create security audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  company_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only company admins can view audit logs for their company
CREATE POLICY "Company admins can view audit logs" 
  ON public.security_audit_log 
  FOR SELECT 
  USING (is_company_admin(company_id));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
  ON public.security_audit_log 
  FOR INSERT 
  WITH CHECK (true);

-- 4. Add audit trigger function
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- 5. Add audit triggers for financial tables
DROP TRIGGER IF EXISTS audit_invoices_trigger ON public.invoices;
CREATE TRIGGER audit_invoices_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_quotes_trigger ON public.quotes;
CREATE TRIGGER audit_quotes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_expenses_trigger ON public.expenses;
CREATE TRIGGER audit_expenses_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_retentions_trigger ON public.retentions;
CREATE TRIGGER audit_retentions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.retentions
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

-- 6. Add data validation constraints
-- Ensure financial amounts are reasonable
ALTER TABLE public.invoices ADD CONSTRAINT invoices_total_check 
  CHECK (total >= 0 AND total <= 10000000);

ALTER TABLE public.quotes ADD CONSTRAINT quotes_total_check 
  CHECK (total >= 0 AND total <= 10000000);

ALTER TABLE public.expenses ADD CONSTRAINT expenses_amount_check 
  CHECK (amount >= 0 AND amount <= 1000000);

-- Ensure dates are reasonable
ALTER TABLE public.invoices ADD CONSTRAINT invoices_due_date_check 
  CHECK (due_date IS NULL OR due_date >= '2020-01-01'::date);

-- 7. Create function to test RLS policies
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS TABLE(table_name text, policy_test text, result boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
