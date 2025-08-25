-- Fix all RLS policies to require authentication instead of allowing anonymous access

-- Fix profiles policies
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Fix all company access policies to require authentication
DROP POLICY IF EXISTS "Agent interactions company access" ON public.agent_interactions;
CREATE POLICY "Agent interactions company access" 
ON public.agent_interactions 
FOR ALL 
TO authenticated 
USING (public.is_company_member(company_id)) 
WITH CHECK (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Assets company access" ON public.asset_tracking;
DROP POLICY IF EXISTS "Assets company check" ON public.asset_tracking;
CREATE POLICY "Assets company access" 
ON public.asset_tracking 
FOR ALL 
TO authenticated 
USING (public.is_company_member(company_id)) 
WITH CHECK (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Business analytics company access" ON public.business_analytics;
CREATE POLICY "Business analytics company access" 
ON public.business_analytics 
FOR ALL 
TO authenticated 
USING (public.is_company_member(company_id)) 
WITH CHECK (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Companies view" ON public.companies;
DROP POLICY IF EXISTS "Companies crud" ON public.companies;
CREATE POLICY "Companies view" 
ON public.companies 
FOR SELECT 
TO authenticated 
USING (public.is_company_member(id));

CREATE POLICY "Companies crud" 
ON public.companies 
FOR ALL 
TO authenticated 
USING (owner_user_id = auth.uid()) 
WITH CHECK (owner_user_id = auth.uid());

-- Fix remaining policies to require authentication
DROP POLICY IF EXISTS "Dayworks company access" ON public.dayworks;
DROP POLICY IF EXISTS "Dayworks company check" ON public.dayworks;
CREATE POLICY "Dayworks company access" 
ON public.dayworks 
FOR ALL 
TO authenticated 
USING (public.is_company_member(company_id)) 
WITH CHECK (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Invoices crud" ON public.invoices;
DROP POLICY IF EXISTS "Invoices view" ON public.invoices;
CREATE POLICY "Invoices company access" 
ON public.invoices 
FOR ALL 
TO authenticated 
USING (public.is_company_member(company_id)) 
WITH CHECK (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Projects crud" ON public.projects;
DROP POLICY IF EXISTS "Projects view" ON public.projects;
CREATE POLICY "Projects company access" 
ON public.projects 
FOR ALL 
TO authenticated 
USING (public.is_company_member(company_id)) 
WITH CHECK (public.is_company_member(company_id));

DROP POLICY IF EXISTS "Quotes company access" ON public.quotes;
DROP POLICY IF EXISTS "Quotes crud" ON public.quotes;
DROP POLICY IF EXISTS "Quotes view" ON public.quotes;
CREATE POLICY "Quotes company access" 
ON public.quotes 
FOR ALL 
TO authenticated 
USING (public.is_company_member(company_id)) 
WITH CHECK (public.is_company_member(company_id));

-- Fix all other tables with similar patterns
DROP POLICY IF EXISTS "Timesheets authenticated access" ON public.timesheets;
DROP POLICY IF EXISTS "Timesheets company access" ON public.timesheets;
CREATE POLICY "Timesheets company access" 
ON public.timesheets 
FOR ALL 
TO authenticated 
USING (public.is_company_member(company_id)) 
WITH CHECK (public.is_company_member(company_id));

-- Fix remaining function vulnerabilities
CREATE OR REPLACE FUNCTION public.no_public_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_secure_search_path()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    SET search_path TO pg_catalog, public;
END;
$function$;