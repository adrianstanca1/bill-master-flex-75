-- Phase 1: Critical Data Access Controls

-- Create enhanced role system
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'manager', 'employee', 'readonly');

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

-- Enhanced RLS Policies for Financial Data (Clients Table)
DROP POLICY IF EXISTS "Clients enhanced access control" ON public.clients;
CREATE POLICY "Clients enhanced access control"
ON public.clients
FOR ALL
TO authenticated
USING (
  is_company_member(company_id) AND 
  (public.is_admin_or_manager(auth.uid()) OR 
   EXISTS (SELECT 1 FROM public.project_assignments pa 
           WHERE pa.user_id = auth.uid() AND pa.company_id = clients.company_id))
)
WITH CHECK (
  is_company_admin(company_id) OR public.has_enhanced_role(auth.uid(), 'manager')
);

-- Enhanced RLS for Business Analytics (Admin Only)
DROP POLICY IF EXISTS "Business analytics company access" ON public.business_analytics;
CREATE POLICY "Business analytics admin only access"
ON public.business_analytics
FOR ALL
TO authenticated
USING (
  is_company_member(company_id) AND public.has_enhanced_role(auth.uid(), 'admin')
)
WITH CHECK (
  is_company_member(company_id) AND public.has_enhanced_role(auth.uid(), 'admin')
);

-- Enhanced RLS for Invoices (Admin/Manager Only)
DROP POLICY IF EXISTS "Invoices company access" ON public.invoices;
CREATE POLICY "Invoices financial access control"
ON public.invoices
FOR ALL
TO authenticated
USING (
  is_company_member(company_id) AND public.is_admin_or_manager(auth.uid())
)
WITH CHECK (
  is_company_member(company_id) AND public.is_admin_or_manager(auth.uid())
);

-- Enhanced RLS for Expenses (Admin/Manager Only)  
DROP POLICY IF EXISTS "Expenses crud" ON public.expenses;
CREATE POLICY "Expenses financial access control"
ON public.expenses
FOR ALL
TO authenticated
USING (
  is_company_member(company_id) AND public.is_admin_or_manager(auth.uid())
)
WITH CHECK (
  is_company_member(company_id) AND public.is_admin_or_manager(auth.uid())
);

-- Enhanced RLS for Quotes (Admin/Manager Only)
DROP POLICY IF EXISTS "Quotes company access" ON public.quotes;
CREATE POLICY "Quotes financial access control"
ON public.quotes
FOR ALL
TO authenticated
USING (
  is_company_member(company_id) AND public.is_admin_or_manager(auth.uid())
)
WITH CHECK (
  is_company_member(company_id) AND public.is_admin_or_manager(auth.uid())
);

-- Enhanced RLS for Profiles (More Restrictive)
DROP POLICY IF EXISTS "Company admins can view company profiles" ON public.profiles;
CREATE POLICY "Enhanced profile access control"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  (company_id IS NOT NULL AND public.has_enhanced_role(auth.uid(), 'admin') AND is_company_member(company_id))
);

-- Create audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_financial_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Enhanced logging for financial operations
  IF TG_TABLE_NAME IN ('invoices', 'quotes', 'expenses') THEN
    -- Ensure user has proper role for this operation
    IF NOT public.is_admin_or_manager(auth.uid()) THEN
      RAISE EXCEPTION 'Insufficient privileges for financial operations';
    END IF;
    
    INSERT INTO public.security_audit_log (
      user_id, 
      company_id, 
      action, 
      resource_type, 
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      COALESCE(NEW.company_id, OLD.company_id),
      'FINANCIAL_' || TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'old_total', CASE WHEN OLD IS NOT NULL THEN OLD.total ELSE NULL END,
        'new_total', CASE WHEN NEW IS NOT NULL THEN NEW.total ELSE NULL END,
        'user_role', (SELECT enhanced_role FROM public.profiles WHERE id = auth.uid()),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers to financial tables
DROP TRIGGER IF EXISTS audit_invoices_trigger ON public.invoices;
CREATE TRIGGER audit_invoices_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.audit_financial_operations();

DROP TRIGGER IF EXISTS audit_quotes_trigger ON public.quotes;
CREATE TRIGGER audit_quotes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.audit_financial_operations();

DROP TRIGGER IF EXISTS audit_expenses_trigger ON public.expenses;
CREATE TRIGGER audit_expenses_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_financial_operations();