-- Clean up conflicting RLS policies on employees table
DROP POLICY IF EXISTS "Users can view company employees" ON public.employees;
DROP POLICY IF EXISTS "Users can insert company employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update company employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete company employees" ON public.employees;
DROP POLICY IF EXISTS "Regular users can view limited employee data" ON public.employees;
DROP POLICY IF EXISTS "Users can view limited employee data" ON public.employees;
DROP POLICY IF EXISTS "Admins and managers can view all employee data" ON public.employees;
DROP POLICY IF EXISTS "Admins and managers can manage all employee data" ON public.employees;

-- Create restrictive policies for full employee data access (admins and managers only)
CREATE POLICY "Admins and managers full access to employee data"
ON public.employees
FOR ALL
USING (
  user_belongs_to_company(company_id) AND 
  (
    public.is_current_user_admin() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  )
);

-- Create a secure view for limited employee data (no sensitive info)
CREATE OR REPLACE VIEW public.employees_public AS
SELECT 
  id,
  company_id,
  name,
  "position",
  status,
  created_at,
  updated_at
FROM public.employees;

-- Create a function to get employee data based on user permissions
CREATE OR REPLACE FUNCTION public.get_employee_data()
RETURNS TABLE (
  id uuid,
  company_id text,
  name text,
  email text,
  phone text,
  employee_position text,
  salary numeric,
  hire_date date,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  has_sensitive_access boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_company_id text;
  is_privileged boolean;
BEGIN
  -- Get user's company ID
  SELECT get_user_company_id() INTO user_company_id;
  
  -- Check if user has privileged access (admin or manager)
  SELECT (
    public.is_current_user_admin() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  ) INTO is_privileged;
  
  -- Return appropriate data based on permissions
  IF is_privileged THEN
    -- Return full data for admins and managers
    RETURN QUERY
    SELECT 
      e.id,
      e.company_id,
      e.name,
      e.email,
      e.phone,
      e."position" as employee_position,
      e.salary,
      e.hire_date,
      e.status,
      e.created_at,
      e.updated_at,
      true as has_sensitive_access
    FROM public.employees e
    WHERE e.company_id = user_company_id;
  ELSE
    -- Return limited data for regular users (no sensitive info)
    RETURN QUERY
    SELECT 
      e.id,
      e.company_id,
      e.name,
      NULL::text as email,
      NULL::text as phone,
      e."position" as employee_position,
      NULL::numeric as salary,
      NULL::date as hire_date,
      e.status,
      e.created_at,
      e.updated_at,
      false as has_sensitive_access
    FROM public.employees e
    WHERE e.company_id = user_company_id;
  END IF;
END;
$$;