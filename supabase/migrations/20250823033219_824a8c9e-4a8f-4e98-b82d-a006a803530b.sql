-- Phase 1: Critical Data Access Controls (Fixed Syntax)

-- Create enhanced role system  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'employee', 'readonly');
    END IF;
END $$;

-- Add role column to profiles table if it doesn't exist with proper default
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'enhanced_role') THEN
        ALTER TABLE public.profiles ADD COLUMN enhanced_role public.app_role DEFAULT 'employee';
    END IF;
END $$;

-- Create function to check enhanced roles
CREATE OR REPLACE FUNCTION public.has_enhanced_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id AND enhanced_role = _role
  );
$$;

-- Create function to check if user is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id AND enhanced_role IN ('admin', 'manager')
  );
$$;

-- Create function to get current user's enhanced role
CREATE OR REPLACE FUNCTION public.get_current_user_enhanced_role()
RETURNS public.app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT enhanced_role FROM public.profiles WHERE id = auth.uid();
$$;