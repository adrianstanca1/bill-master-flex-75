-- Create a function to properly set up a new company and user profile
CREATE OR REPLACE FUNCTION public.setup_user_company(
  company_name text,
  company_country text DEFAULT 'UK',
  company_industry text DEFAULT 'construction'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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