-- Final Migration: Set initial admin roles and complete setup

-- Update existing users to have admin role if they don't have one set
UPDATE public.profiles 
SET enhanced_role = 'admin'::public.app_role 
WHERE enhanced_role IS NULL 
  AND company_id IS NOT NULL;

-- Create a function to automatically assign admin role to company owners
CREATE OR REPLACE FUNCTION public.assign_admin_role_to_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- When a company is created, ensure the owner gets admin role
  UPDATE public.profiles 
  SET enhanced_role = 'admin'::public.app_role
  WHERE id = NEW.owner_user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign admin role to company owners
DROP TRIGGER IF EXISTS assign_admin_role_trigger ON public.companies;
CREATE TRIGGER assign_admin_role_trigger
  AFTER INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.assign_admin_role_to_owner();

-- Create function for role management by admins
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id uuid,
  new_role public.app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_profile RECORD;
  target_user_profile RECORD;
BEGIN
  -- Get current user's profile
  SELECT * INTO current_user_profile
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Get target user's profile
  SELECT * INTO target_user_profile
  FROM public.profiles
  WHERE id = target_user_id;
  
  -- Check if current user is admin in the same company
  IF NOT (current_user_profile.enhanced_role = 'admin' 
          AND current_user_profile.company_id = target_user_profile.company_id) THEN
    RAISE EXCEPTION 'Only company admins can modify user roles';
  END IF;
  
  -- Prevent removing the last admin
  IF target_user_profile.enhanced_role = 'admin' AND new_role != 'admin' THEN
    IF (SELECT COUNT(*) FROM public.profiles 
        WHERE company_id = target_user_profile.company_id 
        AND enhanced_role = 'admin') <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin from the company';
    END IF;
  END IF;
  
  -- Update the role
  UPDATE public.profiles
  SET enhanced_role = new_role,
      updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the role change
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    'ROLE_CHANGED',
    'user_management',
    target_user_id,
    jsonb_build_object(
      'target_user', target_user_id,
      'old_role', target_user_profile.enhanced_role,
      'new_role', new_role,
      'changed_by', auth.uid(),
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$$;