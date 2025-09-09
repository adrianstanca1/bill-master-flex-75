-- Fix security issues from the linter

-- Remove the problematic security definer view and replace with proper approach
DROP VIEW IF EXISTS public.employees_public;

-- Update the function to have proper search_path security
DROP FUNCTION IF EXISTS public.get_employee_data();

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
SET search_path = public, pg_temp
AS $$
DECLARE
  user_company_id text;
  is_privileged boolean;
BEGIN
  -- Get user's company ID
  SELECT public.get_user_company_id() INTO user_company_id;
  
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

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_employee_data() TO authenticated;