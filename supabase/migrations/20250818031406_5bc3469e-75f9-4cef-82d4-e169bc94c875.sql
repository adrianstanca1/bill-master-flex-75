-- Fix critical security issues and enable RLS on public schema
ALTER TABLE IF EXISTS public.security_events ENABLE ROW LEVEL SECURITY;

-- Create proper auth helper function for security events  
CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- Update security events policies for authenticated users only
DROP POLICY IF EXISTS "Security events authenticated insert" ON public.security_events;
CREATE POLICY "Security events authenticated insert" 
  ON public.security_events 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_authenticated_user());

DROP POLICY IF EXISTS "Security events company admin view" ON public.security_events;  
CREATE POLICY "Security events company admin view"
  ON public.security_events
  FOR SELECT 
  TO authenticated
  USING (public.is_authenticated_user());

-- Fix profiles table to ensure proper company_id assignment
UPDATE public.profiles SET company_id = (
  SELECT c.id FROM public.companies c WHERE c.owner_user_id = profiles.id
) WHERE company_id IS NULL;