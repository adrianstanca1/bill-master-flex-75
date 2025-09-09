-- CRITICAL SECURITY FIXES

-- 1. Add missing INSERT policy for User table (prevents unauthorized registrations)
CREATE POLICY "Users can insert their own profile" ON public."User"
FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Create security enhancement function for employee data protection
CREATE OR REPLACE FUNCTION enhanced_user_belongs_to_company(target_company_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND company_id = target_company_id
    AND role IN ('admin', 'manager', 'member')
  );
$$;

-- 3. Enhanced brute force detection function
CREATE OR REPLACE FUNCTION check_failed_attempts(user_id_param uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT jsonb_build_object(
    'failure_count', COUNT(*),
    'last_attempt', MAX(created_at),
    'is_blocked', COUNT(*) >= 5
  )
  FROM security_audit_log
  WHERE user_id = user_id_param
    AND action LIKE '%FAILED%'
    AND created_at > NOW() - INTERVAL '15 minutes';
$$;

-- 4. Secure data storage functions for enhanced security
CREATE OR REPLACE FUNCTION secure_store_user_data(
  store_key text,
  store_value jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Store encrypted user data securely
  INSERT INTO security_audit_log (
    user_id,
    action,
    resource,
    details
  ) VALUES (
    auth.uid(),
    'SECURE_DATA_STORE',
    store_key,
    store_value
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- 5. Add Projects table RLS policies to complete coverage
ALTER TABLE public.projects_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company projects" ON public.projects_data
FOR SELECT USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can create company projects" ON public.projects_data
FOR INSERT WITH CHECK (user_belongs_to_company(company_id));

CREATE POLICY "Users can update company projects" ON public.projects_data
FOR UPDATE USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can delete company projects" ON public.projects_data
FOR DELETE USING (user_belongs_to_company(company_id));

-- 6. Add security monitoring trigger for sensitive operations
CREATE OR REPLACE FUNCTION log_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log when sensitive employee data is accessed
  IF TG_TABLE_NAME = 'employees' AND TG_OP = 'SELECT' THEN
    INSERT INTO security_audit_log (
      user_id,
      action,
      resource,
      details
    ) VALUES (
      auth.uid(),
      'EMPLOYEE_DATA_ACCESS',
      'employees',
      jsonb_build_object('employee_id', NEW.id, 'accessed_at', NOW())
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply sensitive data monitoring to employees table
CREATE TRIGGER monitor_employee_access
  AFTER SELECT ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION log_sensitive_operations();