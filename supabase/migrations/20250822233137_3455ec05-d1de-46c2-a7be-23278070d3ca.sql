-- Fix remaining function search path issues for enhanced security

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix log_security_event trigger function  
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    -- Enhanced security event logging
    INSERT INTO public.security_audit_log (
        user_id,
        action,
        resource_type,
        details
    ) VALUES (
        COALESCE(NEW.user_id, auth.uid()),
        COALESCE(TG_ARGV[0], 'SECURITY_EVENT'),
        COALESCE(TG_ARGV[1], 'general'),
        jsonb_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'timestamp', now()
        )
    );
    RETURN NEW;
END;
$function$;

-- Fix analyze_security_events trigger function
CREATE OR REPLACE FUNCTION public.analyze_security_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    -- Analyze security patterns in real-time
    -- This could trigger alerts for suspicious activities
    IF NEW.action IN ('LOGIN_FAILED', 'SECURITY_VIOLATION', 'UNAUTHORIZED_ACCESS') THEN
        -- Check for patterns that might indicate attacks
        PERFORM 1;  -- Placeholder for analysis logic
    END IF;
    RETURN NEW;
END;
$function$;

-- Fix audit_sensitive_operations function
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Log operations on financial data
  IF TG_TABLE_NAME IN ('invoices', 'quotes', 'expenses', 'retentions') THEN
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
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'old_total', OLD.total,
        'new_total', NEW.total,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix track_auth_events function
CREATE OR REPLACE FUNCTION public.track_auth_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    -- Log authentication event
    INSERT INTO public.security_audit_log (
        user_id,
        action,
        resource_type,
        details
    ) VALUES (
        NEW.id,
        'USER_AUTHENTICATED',
        'authentication',
        jsonb_build_object(
            'email', NEW.email,
            'confirmed_at', NEW.confirmed_at,
            'last_sign_in_at', NEW.last_sign_in_at
        )
    );
    RETURN NEW;
END;
$function$;