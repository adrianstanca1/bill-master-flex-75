-- 1) Secure security_audit_log inserts and enforce context

-- Drop overly permissive insert policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'security_audit_log' AND policyname = 'System can insert audit logs'
  ) THEN
    EXECUTE 'DROP POLICY "System can insert audit logs" ON public.security_audit_log';
  END IF;
END $$;

-- Insert policy only for authenticated users
CREATE POLICY "Authenticated users can insert audit logs"
ON public.security_audit_log
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Enforce user and company context via trigger
CREATE OR REPLACE FUNCTION public.audit_log_enforce_context()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to insert audit logs';
  END IF;

  -- Force user_id to current user
  NEW.user_id := auth.uid();

  -- Derive company_id from profile if missing
  IF NEW.company_id IS NULL THEN
    SELECT p.company_id INTO NEW.company_id
    FROM public.profiles p
    WHERE p.id = auth.uid();
  END IF;

  -- Ensure created_at is set
  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;

  -- Normalize details field
  IF NEW.details IS NULL THEN
    NEW.details := '{}'::jsonb;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_log_enforce_context ON public.security_audit_log;
CREATE TRIGGER trg_audit_log_enforce_context
BEFORE INSERT ON public.security_audit_log
FOR EACH ROW
EXECUTE FUNCTION public.audit_log_enforce_context();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_security_audit_log_company_created_at ON public.security_audit_log(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action ON public.security_audit_log(action);


-- 2) Prevent profiles.role self-escalation and company_id hijack
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_company_admin(COALESCE(OLD.company_id, NEW.company_id)) THEN
      RAISE EXCEPTION 'Only company admins can modify roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_escalation();

CREATE OR REPLACE FUNCTION public.prevent_profile_company_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
    IF NOT public.is_company_admin(OLD.company_id) THEN
      RAISE EXCEPTION 'Only company admins can change company assignment';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_company_change ON public.profiles;
CREATE TRIGGER trg_prevent_profile_company_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_company_change();


-- 3) Tighten api_integrations RLS: members can read, admins mutate
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'api_integrations' AND policyname = 'API integrations company access'
  ) THEN
    EXECUTE 'DROP POLICY "API integrations company access" ON public.api_integrations';
  END IF;
END $$;

-- SELECT for company members
CREATE POLICY "API integrations select for members"
ON public.api_integrations
FOR SELECT
TO authenticated
USING (public.is_company_member(company_id));

-- INSERT only by admins
CREATE POLICY "API integrations insert admins only"
ON public.api_integrations
FOR INSERT
TO authenticated
WITH CHECK (public.is_company_admin(company_id));

-- UPDATE only by admins
CREATE POLICY "API integrations update admins only"
ON public.api_integrations
FOR UPDATE
TO authenticated
USING (public.is_company_admin(company_id))
WITH CHECK (public.is_company_admin(company_id));

-- DELETE only by admins
CREATE POLICY "API integrations delete admins only"
ON public.api_integrations
FOR DELETE
TO authenticated
USING (public.is_company_admin(company_id));
