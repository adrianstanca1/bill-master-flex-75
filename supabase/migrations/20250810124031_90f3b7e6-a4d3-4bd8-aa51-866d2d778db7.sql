-- Add helper to check admin rights
CREATE OR REPLACE FUNCTION public.is_company_admin(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
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

-- Tighten RLS on company_members: drop permissive ALL policy and replace with admin-only write policies
DROP POLICY IF EXISTS "Members manage" ON public.company_members;

-- Keep existing SELECT policy ("Members view") intact. Create granular admin-only write policies.
CREATE POLICY "Company members insert (admin only)"
ON public.company_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "Company members update (admin only)"
ON public.company_members
FOR UPDATE
TO authenticated
USING (public.is_company_admin(company_id))
WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY "Company members delete (admin only)"
ON public.company_members
FOR DELETE
TO authenticated
USING (public.is_company_admin(company_id));