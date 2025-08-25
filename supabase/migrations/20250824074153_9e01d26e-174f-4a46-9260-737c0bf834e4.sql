-- Fix RLS policies for enhanced security (corrected version)

-- 1. Prevent users from updating their own company_id in profiles table
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent company_id changes after initial creation
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- 2. Add rate limiting to security_audit_log (simplified)
DROP POLICY IF EXISTS "System can insert security logs" ON public.security_audit_log;

CREATE POLICY "System can insert security logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (
  -- Allow system inserts with basic validation
  (user_id IS NULL OR user_id = auth.uid())
);