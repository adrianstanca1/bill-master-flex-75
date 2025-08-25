-- Phase 1: Critical Database Security Hardening

-- Fix database function vulnerabilities by adding SET search_path to remaining functions
CREATE OR REPLACE FUNCTION public.calculate_project_health(project_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  health_score NUMERIC := 100;
  project_data RECORD;
  days_overdue INTEGER;
  budget_variance NUMERIC;
BEGIN
  -- Get project data
  SELECT * INTO project_data 
  FROM public.projects 
  WHERE id = project_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Check if project is overdue
  IF project_data.end_date IS NOT NULL AND project_data.end_date < CURRENT_DATE THEN
    days_overdue := CURRENT_DATE - project_data.end_date;
    health_score := health_score - (days_overdue * 2);
  END IF;
  
  -- Check budget variance
  IF project_data.budget > 0 AND project_data.spent > 0 THEN
    budget_variance := (project_data.spent / project_data.budget) * 100;
    IF budget_variance > 100 THEN
      health_score := health_score - (budget_variance - 100);
    END IF;
  END IF;
  
  -- Check progress vs time elapsed
  IF project_data.start_date IS NOT NULL AND project_data.end_date IS NOT NULL THEN
    DECLARE
      total_days INTEGER := project_data.end_date - project_data.start_date;
      elapsed_days INTEGER := CURRENT_DATE - project_data.start_date;
      expected_progress NUMERIC;
    BEGIN
      IF total_days > 0 AND elapsed_days > 0 THEN
        expected_progress := (elapsed_days::NUMERIC / total_days) * 100;
        IF project_data.progress < expected_progress THEN
          health_score := health_score - (expected_progress - project_data.progress);
        END IF;
      END IF;
    END;
  END IF;
  
  RETURN GREATEST(health_score, 0);
END;
$function$;

-- Fix remaining database functions with search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Add server-side security validation function
CREATE OR REPLACE FUNCTION public.validate_security_context()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  user_profile RECORD;
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check user has valid company association
  SELECT * INTO user_profile
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF NOT FOUND OR user_profile.company_id IS NULL THEN
    -- Log security violation
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource_type,
      details
    ) VALUES (
      auth.uid(),
      'SECURITY_VIOLATION',
      'security_validation',
      jsonb_build_object(
        'violation_type', 'INVALID_COMPANY_ASSOCIATION',
        'user_id', auth.uid(),
        'timestamp', now()
      )
    );
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Add function to validate company isolation
CREATE OR REPLACE FUNCTION public.enforce_company_isolation(target_company_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  user_company_id uuid;
BEGIN
  -- Get user's company
  SELECT company_id INTO user_company_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Ensure user can only access their company's data
  IF user_company_id IS NULL OR user_company_id != target_company_id THEN
    -- Log security violation
    INSERT INTO public.security_audit_log (
      user_id,
      company_id,
      action,
      resource_type,
      details
    ) VALUES (
      auth.uid(),
      user_company_id,
      'SECURITY_VIOLATION',
      'company_isolation',
      jsonb_build_object(
        'violation_type', 'COMPANY_ISOLATION_BREACH',
        'attempted_company_id', target_company_id,
        'user_company_id', user_company_id,
        'timestamp', now()
      )
    );
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Create table for security policies management
CREATE TABLE IF NOT EXISTS public.security_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_name text NOT NULL,
  policy_type text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  configuration jsonb NOT NULL DEFAULT '{}',
  company_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on security policies
ALTER TABLE public.security_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security_policies
CREATE POLICY "Company admins can manage security policies"
ON public.security_policies
FOR ALL
USING (public.is_company_admin(company_id))
WITH CHECK (public.is_company_admin(company_id));

-- Create updated_at trigger for security_policies
CREATE TRIGGER update_security_policies_updated_at
BEFORE UPDATE ON public.security_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();