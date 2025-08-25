-- Phase 1: Critical Security Fixes

-- Fix OAuth state parameter security
CREATE TABLE public.oauth_state_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_token TEXT NOT NULL UNIQUE,
  user_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on OAuth state store
ALTER TABLE public.oauth_state_store ENABLE ROW LEVEL SECURITY;

-- RLS policies for OAuth state store
CREATE POLICY "OAuth state tokens are public for validation"
ON public.oauth_state_store
FOR SELECT
USING (expires_at > now() AND NOT used);

CREATE POLICY "Service can insert OAuth state tokens" 
ON public.oauth_state_store
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service can update OAuth state tokens"
ON public.oauth_state_store  
FOR UPDATE
USING (expires_at > now());

-- Phase 2: Enhanced Access Control for Financial Data

-- Update clients RLS to be more restrictive
DROP POLICY IF EXISTS "Clients enhanced access control" ON public.clients;

CREATE POLICY "Clients role-based access control"
ON public.clients
FOR ALL
USING (
  is_company_member(company_id) AND (
    -- Admins and managers can access all clients
    is_admin_or_manager(auth.uid()) OR
    -- Regular employees can only access clients from projects they're assigned to
    EXISTS (
      SELECT 1 FROM public.project_assignments pa
      JOIN public.projects p ON pa.project_id = p.id
      WHERE pa.user_id = auth.uid() 
      AND p.client = clients.name
      AND pa.company_id = clients.company_id
    )
  )
)
WITH CHECK (is_admin_or_manager(auth.uid()) AND is_company_member(company_id));

-- Update expenses RLS to restrict to admin/manager roles
DROP POLICY IF EXISTS "Expenses crud" ON public.expenses;
DROP POLICY IF EXISTS "Expenses view" ON public.expenses;

CREATE POLICY "Expenses admin manager access"
ON public.expenses
FOR ALL
USING (is_company_member(company_id) AND is_admin_or_manager(auth.uid()))
WITH CHECK (is_company_member(company_id) AND is_admin_or_manager(auth.uid()));

-- Update business analytics RLS to restrict to admin/manager roles  
DROP POLICY IF EXISTS "Business analytics company access" ON public.business_analytics;

CREATE POLICY "Business analytics admin manager access"
ON public.business_analytics
FOR ALL
USING (is_company_member(company_id) AND is_admin_or_manager(auth.uid()))
WITH CHECK (is_company_member(company_id) AND is_admin_or_manager(auth.uid()));

-- Phase 3: Enhanced Security Logging

-- Add function to validate OAuth state tokens
CREATE OR REPLACE FUNCTION public.validate_oauth_state(token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  valid_token RECORD;
BEGIN
  -- Find and mark token as used
  UPDATE public.oauth_state_store 
  SET used = true
  WHERE state_token = token 
    AND expires_at > now() 
    AND NOT used
  RETURNING * INTO valid_token;
  
  -- Log the validation attempt
  INSERT INTO public.security_audit_log (
    action,
    resource_type,
    details
  ) VALUES (
    CASE WHEN valid_token.id IS NOT NULL THEN 'OAUTH_STATE_VALIDATED' ELSE 'OAUTH_STATE_INVALID' END,
    'oauth_security',
    jsonb_build_object(
      'token_provided', token IS NOT NULL,
      'token_valid', valid_token.id IS NOT NULL,
      'timestamp', now()
    )
  );
  
  RETURN valid_token.id IS NOT NULL;
END;
$function$;

-- Add function to store OAuth state tokens
CREATE OR REPLACE FUNCTION public.store_oauth_state(token TEXT, session_id TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  state_id UUID;
BEGIN
  INSERT INTO public.oauth_state_store (state_token, user_session_id)
  VALUES (token, session_id)
  RETURNING id INTO state_id;
  
  -- Clean up expired tokens
  DELETE FROM public.oauth_state_store 
  WHERE expires_at < now() OR (created_at < now() - INTERVAL '1 hour' AND used = true);
  
  RETURN state_id;
END;
$function$;

-- Phase 4: Enhanced Input Validation Function
CREATE OR REPLACE FUNCTION public.sanitize_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Basic sanitization - remove dangerous patterns
  input_text := regexp_replace(input_text, '<script[^>]*>.*?</script>', '', 'gi');
  input_text := regexp_replace(input_text, 'javascript:', '', 'gi');
  input_text := regexp_replace(input_text, 'data:', '', 'gi');
  input_text := regexp_replace(input_text, 'vbscript:', '', 'gi');
  input_text := regexp_replace(input_text, 'on\w+\s*=', '', 'gi');
  
  -- Log if sanitization occurred
  IF input_text != $1 THEN
    INSERT INTO public.security_audit_log (
      action,
      resource_type,
      details
    ) VALUES (
      'INPUT_SANITIZED',
      'input_validation',
      jsonb_build_object(
        'original_length', length($1),
        'sanitized_length', length(input_text),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN input_text;
END;
$function$;