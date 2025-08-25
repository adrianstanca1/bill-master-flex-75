
-- Fix critical security issues identified in the security review

-- 1. Fix company isolation - ensure all users have proper company associations
UPDATE public.profiles 
SET company_id = (
  SELECT id FROM public.companies 
  WHERE owner_user_id = profiles.id 
  LIMIT 1
)
WHERE company_id IS NULL 
AND id IN (SELECT owner_user_id FROM public.companies);

-- 2. Add constraint to prevent null company_id for active users
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_company_id_required 
CHECK (company_id IS NOT NULL OR role = 'system');

-- 3. Fix database functions security - add proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 4. Fix audit_log_enforce_context function
CREATE OR REPLACE FUNCTION public.audit_log_enforce_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- 5. Fix other security definer functions
CREATE OR REPLACE FUNCTION public.setup_user_company(company_name text, company_country text DEFAULT 'UK'::text, company_industry text DEFAULT 'construction'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_company_id uuid;
  user_id uuid;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Create the company
  INSERT INTO public.companies (name, country, industry, owner_user_id)
  VALUES (company_name, company_country, company_industry, user_id)
  RETURNING id INTO new_company_id;
  
  -- Update the user's profile with the company ID
  UPDATE public.profiles 
  SET company_id = new_company_id,
      updated_at = now()
  WHERE id = user_id;
  
  -- Add the user as a member of their own company
  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (new_company_id, user_id, 'admin')
  ON CONFLICT (company_id, user_id) DO NOTHING;
  
  RETURN new_company_id;
END;
$$;

-- 6. Update RLS policies to remove anonymous access and ensure proper authentication

-- Fix asset_tracking policies
DROP POLICY IF EXISTS "Assets company access" ON public.asset_tracking;
DROP POLICY IF EXISTS "Assets company check" ON public.asset_tracking;

CREATE POLICY "Assets company access authenticated" 
ON public.asset_tracking 
FOR ALL 
TO authenticated 
USING (is_company_member(company_id))
WITH CHECK (is_company_member(company_id));

-- Fix dayworks policies
DROP POLICY IF EXISTS "Dayworks company access" ON public.dayworks;
DROP POLICY IF EXISTS "Dayworks company check" ON public.dayworks;

CREATE POLICY "Dayworks company access authenticated" 
ON public.dayworks 
FOR ALL 
TO authenticated 
USING (is_company_member(company_id))
WITH CHECK (is_company_member(company_id));

-- Fix rams_documents policies
DROP POLICY IF EXISTS "RAMS company access" ON public.rams_documents;
DROP POLICY IF EXISTS "RAMS company check" ON public.rams_documents;

CREATE POLICY "RAMS company access authenticated" 
ON public.rams_documents 
FOR ALL 
TO authenticated 
USING (is_company_member(company_id))
WITH CHECK (is_company_member(company_id));

-- Fix reminders policies
DROP POLICY IF EXISTS "Reminders company access" ON public.reminders;
DROP POLICY IF EXISTS "Reminders company check" ON public.reminders;

CREATE POLICY "Reminders company access authenticated" 
ON public.reminders 
FOR ALL 
TO authenticated 
USING (is_company_member(company_id))
WITH CHECK (is_company_member(company_id));

-- 7. Add trigger to automatically set company_id on profile creation
CREATE OR REPLACE FUNCTION public.auto_set_company_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If company_id is null and user owns a company, set it
  IF NEW.company_id IS NULL THEN
    SELECT id INTO NEW.company_id
    FROM public.companies 
    WHERE owner_user_id = NEW.id 
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_company_context_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_company_context();

-- 8. Create security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_violation(violation_type text, details jsonb DEFAULT '{}')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    details
  ) VALUES (
    auth.uid(),
    'SECURITY_VIOLATION',
    violation_type,
    details || jsonb_build_object('timestamp', now(), 'violation_type', violation_type)
  );
END;
$$;
