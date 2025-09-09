-- Create security definer function to get user's company ID
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS TEXT AS $$
  SELECT company_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create security definer function to check if user belongs to company
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(target_company_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND company_id = target_company_id
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop all existing policies on asset_tracking
DROP POLICY IF EXISTS "Allow all operations on asset_tracking" ON public.asset_tracking;
DROP POLICY IF EXISTS "Users can view assets for their company" ON public.asset_tracking;
DROP POLICY IF EXISTS "Users can insert assets for their company" ON public.asset_tracking;
DROP POLICY IF EXISTS "Users can update assets for their company" ON public.asset_tracking;
DROP POLICY IF EXISTS "Users can delete assets for their company" ON public.asset_tracking;

-- Create new secure policies for asset_tracking
CREATE POLICY "Users can view company assets" 
ON public.asset_tracking 
FOR SELECT 
USING (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can create company assets" 
ON public.asset_tracking 
FOR INSERT 
WITH CHECK (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can modify company assets" 
ON public.asset_tracking 
FOR UPDATE 
USING (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can remove company assets" 
ON public.asset_tracking 
FOR DELETE 
USING (public.user_belongs_to_company(company_id));

-- Drop all existing policies on projects_data
DROP POLICY IF EXISTS "Allow all operations on projects_data" ON public.projects_data;
DROP POLICY IF EXISTS "Users can view projects for their company" ON public.projects_data;
DROP POLICY IF EXISTS "Users can insert projects for their company" ON public.projects_data;
DROP POLICY IF EXISTS "Users can update projects for their company" ON public.projects_data;
DROP POLICY IF EXISTS "Users can delete projects for their company" ON public.projects_data;

-- Create new secure policies for projects_data
CREATE POLICY "Users can view company projects" 
ON public.projects_data 
FOR SELECT 
USING (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can create company projects" 
ON public.projects_data 
FOR INSERT 
WITH CHECK (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can modify company projects" 
ON public.projects_data 
FOR UPDATE 
USING (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can remove company projects" 
ON public.projects_data 
FOR DELETE 
USING (public.user_belongs_to_company(company_id));