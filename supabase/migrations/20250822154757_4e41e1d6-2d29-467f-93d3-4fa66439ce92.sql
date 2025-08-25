-- Phase 1: Critical Database Security Fixes

-- 1. Fix nullable company_id in profiles table (critical security issue)
ALTER TABLE public.profiles 
ALTER COLUMN company_id SET NOT NULL;

-- 2. Add foreign key constraints for better data integrity
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- 3. Fix all remaining functions with proper search paths
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM company_members m
      WHERE m.company_id = _company_id
        AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM company_members m
      WHERE m.company_id = _company_id
        AND m.user_id = auth.uid()
        AND m.role = 'admin'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.is_setup_complete()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT company_id IS NOT NULL FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE(id uuid, first_name text, last_name text, avatar_url text, phone text, company_id uuid, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.phone,
    p.company_id,
    p.role,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = auth.uid();
$$;

-- 4. Enhanced security audit trigger
CREATE OR REPLACE FUNCTION public.enhanced_audit_log_enforce_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to insert audit logs';
  END IF;

  NEW.user_id := auth.uid();

  -- Get company_id from user profile if not provided
  IF NEW.company_id IS NULL THEN
    SELECT p.company_id INTO NEW.company_id
    FROM profiles p
    WHERE p.id = auth.uid();
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;

  IF NEW.details IS NULL THEN
    NEW.details := '{}'::jsonb;
  END IF;

  -- Add additional security context
  NEW.details := NEW.details || jsonb_build_object(
    'session_id', (auth.jwt() ->> 'session_id'),
    'ip_address', current_setting('request.headers', true)::json ->> 'x-forwarded-for',
    'user_agent', current_setting('request.headers', true)::json ->> 'user-agent'
  );

  RETURN NEW;
END;
$$;

-- 5. Enhanced security policies for critical tables
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id AND company_id IS NOT NULL)
WITH CHECK (auth.uid() = id AND company_id IS NOT NULL);

-- 6. Add trigger for profile company validation
CREATE OR REPLACE FUNCTION public.validate_user_company_association()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Ensure users have company association for security isolation
  IF NEW.company_id IS NULL AND TG_OP = 'UPDATE' THEN
    -- Log security violation
    INSERT INTO security_audit_log (
      user_id,
      action,
      resource_type,
      details
    ) VALUES (
      NEW.id,
      'SECURITY_VIOLATION',
      'company_isolation',
      jsonb_build_object(
        'violation_type', 'COMPANY_ASSOCIATION_REMOVED',
        'user_id', NEW.id,
        'timestamp', now()
      )
    );
    
    RAISE EXCEPTION 'Company association cannot be removed for security reasons';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the trigger
DROP TRIGGER IF EXISTS validate_user_company_trigger ON public.profiles;
CREATE TRIGGER validate_user_company_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION validate_user_company_association();