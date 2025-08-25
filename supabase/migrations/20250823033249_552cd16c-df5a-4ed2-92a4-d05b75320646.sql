-- Continue with Enhanced RLS Policies and Security Features

-- Enhanced RLS Policies for Financial Data (Clients Table) - Replace existing
DROP POLICY IF EXISTS "Clients company view" ON public.clients;
DROP POLICY IF EXISTS "Clients delete admin only" ON public.clients;
DROP POLICY IF EXISTS "Clients update admin only" ON public.clients;
DROP POLICY IF EXISTS "Clients view" ON public.clients;
DROP POLICY IF EXISTS "Clients write admin only" ON public.clients;

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