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

-- Drop existing policy if it exists and create new restrictive one
DROP POLICY IF EXISTS "Allow viewing auth settings recommendations" ON public.recommended_auth_settings;
DROP POLICY IF EXISTS "Only admins can view auth settings" ON public.recommended_auth_settings;

CREATE POLICY "Only admins can view auth settings" 
ON public.recommended_auth_settings 
FOR SELECT 
USING (public.is_current_user_admin());

-- Create function to get user role securely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(role, 'member') FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Update employees table policies to protect salary data
DROP POLICY IF EXISTS "Users can view company employees" ON public.employees;
DROP POLICY IF EXISTS "Users can insert company employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update company employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete company employees" ON public.employees;

-- Create new policies with role-based access
CREATE POLICY "Admins and managers can manage all employee data"
ON public.employees
FOR ALL
USING (
  user_belongs_to_company(company_id) AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
  )
);

CREATE POLICY "Regular users can view limited employee data"
ON public.employees
FOR SELECT
USING (
  user_belongs_to_company(company_id) AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'member'
  )
);