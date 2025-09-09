-- Create profiles table to link users to companies
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Fix asset_tracking RLS policies
DROP POLICY IF EXISTS "Allow all operations on asset_tracking" ON public.asset_tracking;

CREATE POLICY "Users can view assets for their company" 
ON public.asset_tracking 
FOR SELECT 
USING (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can insert assets for their company" 
ON public.asset_tracking 
FOR INSERT 
WITH CHECK (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can update assets for their company" 
ON public.asset_tracking 
FOR UPDATE 
USING (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can delete assets for their company" 
ON public.asset_tracking 
FOR DELETE 
USING (public.user_belongs_to_company(company_id));

-- Fix projects_data RLS policies
DROP POLICY IF EXISTS "Allow all operations on projects_data" ON public.projects_data;

CREATE POLICY "Users can view projects for their company" 
ON public.projects_data 
FOR SELECT 
USING (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can insert projects for their company" 
ON public.projects_data 
FOR INSERT 
WITH CHECK (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can update projects for their company" 
ON public.projects_data 
FOR UPDATE 
USING (public.user_belongs_to_company(company_id));

CREATE POLICY "Users can delete projects for their company" 
ON public.projects_data 
FOR DELETE 
USING (public.user_belongs_to_company(company_id));

-- Add trigger to update profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();