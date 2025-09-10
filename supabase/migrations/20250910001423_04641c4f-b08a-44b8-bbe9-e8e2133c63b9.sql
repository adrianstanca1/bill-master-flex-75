-- Fix function search path security warnings

-- Fix secure_employee_access_log function
CREATE OR REPLACE FUNCTION public.secure_employee_access_log()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
      WHEN 'INSERT' THEN 'EMPLOYEE_DATA_CREATE'
      WHEN 'UPDATE' THEN 'EMPLOYEE_DATA_UPDATE'
      WHEN 'DELETE' THEN 'EMPLOYEE_DATA_DELETE'
    END,
    'employees',
    jsonb_build_object(
      'employee_id', COALESCE(NEW.id, OLD.id),
      'company_id', COALESCE(NEW.company_id, OLD.company_id),
      'operation', TG_OP
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix sanitize_client_data function
CREATE OR REPLACE FUNCTION public.sanitize_client_data()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix validate_invoice_security function
CREATE OR REPLACE FUNCTION public.validate_invoice_security()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix cleanup_old_audit_logs function
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;