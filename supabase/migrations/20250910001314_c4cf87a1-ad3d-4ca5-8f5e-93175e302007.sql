-- Enhanced RLS policies and security improvements

-- Add better logging for employee data access
CREATE OR REPLACE FUNCTION public.secure_employee_access_log()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to employee data for audit purposes
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource,
    details,
    created_at
  ) VALUES (
    auth.uid(),
    CASE TG_OP
      WHEN 'SELECT' THEN 'EMPLOYEE_DATA_ACCESS'
      WHEN 'INSERT' THEN 'EMPLOYEE_DATA_CREATE'
      WHEN 'UPDATE' THEN 'EMPLOYEE_DATA_UPDATE'
      WHEN 'DELETE' THEN 'EMPLOYEE_DATA_DELETE'
    END,
    'employees',
    jsonb_build_object(
      'employee_id', COALESCE(NEW.id, OLD.id),
      'company_id', COALESCE(NEW.company_id, OLD.company_id),
      'operation', TG_OP,
      'sensitive_fields_accessed', CASE 
        WHEN TG_OP = 'SELECT' THEN jsonb_build_array('salary', 'email', 'phone')
        ELSE null
      END
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for employee access logging
DROP TRIGGER IF EXISTS employee_access_audit_trigger ON public.employees;
CREATE TRIGGER employee_access_audit_trigger
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.secure_employee_access_log();

-- Add enhanced client data protection
CREATE OR REPLACE FUNCTION public.sanitize_client_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize email addresses
  IF NEW.email IS NOT NULL THEN
    NEW.email = lower(trim(NEW.email));
    -- Basic email validation
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;
  END IF;
  
  -- Sanitize phone numbers (remove non-numeric characters except +)
  IF NEW.phone IS NOT NULL THEN
    NEW.phone = regexp_replace(NEW.phone, '[^\d+\-\s\(\)]', '', 'g');
  END IF;
  
  -- Log data modification for audit
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    resource,
    details
  ) VALUES (
    auth.uid(),
    'CLIENT_DATA_SANITIZED',
    'clients',
    jsonb_build_object(
      'client_id', NEW.id,
      'company_id', NEW.company_id,
      'fields_modified', jsonb_build_array('email', 'phone')
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for client data sanitization
DROP TRIGGER IF EXISTS client_data_sanitize_trigger ON public.clients;
CREATE TRIGGER client_data_sanitize_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_client_data();

-- Enhanced invoice security with amount validation
CREATE OR REPLACE FUNCTION public.validate_invoice_security()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate invoice amounts are reasonable
  IF NEW.amount IS NOT NULL AND (NEW.amount < 0 OR NEW.amount > 1000000) THEN
    -- Log suspicious activity
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource,
      details
    ) VALUES (
      auth.uid(),
      'SUSPICIOUS_INVOICE_AMOUNT',
      'invoices',
      jsonb_build_object(
        'invoice_id', NEW.id,
        'amount', NEW.amount,
        'company_id', NEW.company_id,
        'severity', 'high'
      )
    );
    
    IF NEW.amount < 0 THEN
      RAISE EXCEPTION 'Invoice amount cannot be negative';
    END IF;
    
    IF NEW.amount > 1000000 THEN
      RAISE EXCEPTION 'Invoice amount exceeds maximum limit';
    END IF;
  END IF;
  
  -- Validate invoice number uniqueness within company
  IF EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE company_id = NEW.company_id 
    AND invoice_number = NEW.invoice_number 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Invoice number already exists for this company';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invoice validation
DROP TRIGGER IF EXISTS invoice_security_validation_trigger ON public.invoices;
CREATE TRIGGER invoice_security_validation_trigger
  BEFORE INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.validate_invoice_security();

-- Add session security tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  last_activity timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true
);

-- Enable RLS on sessions table
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for user sessions
CREATE POLICY "Users can only view their own sessions"
ON public.user_sessions
FOR ALL
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_action ON public.security_audit_log(user_id, action);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active, last_activity);

-- Create function to clean up old audit logs (retention policy)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.security_audit_log
  WHERE created_at < now() - INTERVAL '90 days';
  
  -- Log cleanup operation
  INSERT INTO public.security_audit_log (
    action,
    resource,
    details
  ) VALUES (
    'AUDIT_LOG_CLEANUP',
    'security_audit_log',
    jsonb_build_object(
      'cleanup_date', now(),
      'retention_days', 90
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;