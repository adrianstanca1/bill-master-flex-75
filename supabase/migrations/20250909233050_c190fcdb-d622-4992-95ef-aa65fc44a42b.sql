-- Fix critical User table RLS policies
-- Currently the User table allows unauthorized access to password fields

-- First, ensure RLS is enabled on the User table
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- Drop existing insufficient policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public."User";
DROP POLICY IF EXISTS "Users can update their own profile" ON public."User";

-- Create secure RLS policies for User table
CREATE POLICY "Users can view only their own profile"
ON public."User"
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update only their own profile"
ON public."User"
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users should NOT be able to insert or delete User records directly
-- These should be handled through auth triggers only

-- Create policy to prevent direct user creation (should go through auth.users)
CREATE POLICY "Prevent direct user creation"
ON public."User"
FOR INSERT
WITH CHECK (false);

-- Create policy to prevent user deletion (should be handled through auth)
CREATE POLICY "Prevent direct user deletion"
ON public."User"
FOR DELETE
USING (false);

-- Log this security fix
INSERT INTO public.security_audit_log (action, details, user_id)
VALUES (
  'SECURITY_FIX_USER_RLS',
  '{"fix": "Added proper RLS policies to User table", "severity": "critical"}',
  auth.uid()
);