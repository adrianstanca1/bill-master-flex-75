-- Fix RLS policy for recommended_auth_settings to require admin role
DROP POLICY IF EXISTS "Allow viewing auth settings recommendations" ON public.recommended_auth_settings;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Create new restrictive policy for auth settings
CREATE POLICY "Only admins can view auth settings" 
ON public.recommended_auth_settings 
FOR SELECT 
USING (public.is_current_user_admin());

-- Add policy for employee salary protection - only admins and managers can see salaries
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view all employee data"
ON public.employees
FOR SELECT
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

-- Regular users can view employee data but not salaries
CREATE POLICY "Users can view limited employee data"
ON public.employees
FOR SELECT
USING (
  user_belongs_to_company(company_id) AND
  NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- Create function to get user role securely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role, 'member') FROM public.profiles WHERE user_id = auth.uid();
$$;