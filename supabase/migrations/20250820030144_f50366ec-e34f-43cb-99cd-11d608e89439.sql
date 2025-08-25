-- Phase 1: Database Security Hardening - Fix Critical RLS and Function Security Issues

-- 1. Fix Database Functions Security - Add proper search_path to all SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.company_members m
      WHERE m.company_id = _company_id
        AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.company_members m
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
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE(id uuid, first_name text, last_name text, avatar_url text, phone text, company_id uuid, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
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
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_setup_complete()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT company_id IS NOT NULL FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Validate input
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  -- Insert profile with error handling
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    now(),
    now()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Fix Profile RLS Policies - Require Authentication
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Add User-Company Association Validation
CREATE OR REPLACE FUNCTION public.validate_user_company_association()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Ensure users have company association for security isolation
  IF NEW.company_id IS NULL AND TG_OP = 'UPDATE' THEN
    -- Log security violation
    INSERT INTO public.security_audit_log (
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

-- Add trigger to prevent company association removal
DROP TRIGGER IF EXISTS validate_user_company_trigger ON public.profiles;
CREATE TRIGGER validate_user_company_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_company_association();

-- 4. Enhance Security Audit Logging
CREATE OR REPLACE FUNCTION public.enhanced_audit_log_enforce_context()
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

  -- Get company_id from user profile if not provided
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

  -- Add additional security context
  NEW.details := NEW.details || jsonb_build_object(
    'session_id', (auth.jwt() ->> 'session_id'),
    'ip_address', current_setting('request.headers', true)::json ->> 'x-forwarded-for',
    'user_agent', current_setting('request.headers', true)::json ->> 'user-agent'
  );

  RETURN NEW;
END;
$$;

-- Update the trigger to use enhanced function
DROP TRIGGER IF EXISTS audit_log_context_trigger ON public.security_audit_log;
CREATE TRIGGER audit_log_context_trigger
  BEFORE INSERT ON public.security_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.enhanced_audit_log_enforce_context();

-- 5. Create Secure Webhook Secret Management
CREATE TABLE IF NOT EXISTS public.webhook_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  encrypted_secret text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(webhook_id)
);

ALTER TABLE public.webhook_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Webhook secrets company admin access"
ON public.webhook_secrets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.webhooks w
    WHERE w.id = webhook_id
    AND public.is_company_admin(w.company_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.webhooks w
    WHERE w.id = webhook_id
    AND public.is_company_admin(w.company_id)
  )
);

-- Remove secret_key from webhooks table for security
ALTER TABLE public.webhooks DROP COLUMN IF EXISTS secret_key;