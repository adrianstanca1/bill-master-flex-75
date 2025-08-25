-- Fix final remaining database functions with search_path security

-- Fix: log_security_event (company_id variant) function
CREATE OR REPLACE FUNCTION public.log_security_event(company_id uuid, event_type text, severity text, description text, additional_details jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    INSERT INTO public.security_events (
        company_id,
        event_type, 
        severity,
        description,
        details
    ) VALUES (
        company_id,
        event_type,
        severity,
        description,
        additional_details
    );
END;
$function$;

-- Fix: analyze_security_events (company variant) function  
CREATE OR REPLACE FUNCTION public.analyze_security_events(target_company_id uuid, lookback_hours integer DEFAULT 24)
 RETURNS TABLE(event_type text, total_count bigint, severity_distribution jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        se.event_type,
        COUNT(*) as total_count,
        jsonb_object_agg(severity, count) as severity_distribution
    FROM public.security_events se
    WHERE 
        se.created_at >= NOW() - (lookback_hours || ' hours')::interval
    GROUP BY se.event_type;
END;
$function$;

-- Fix: track_auth_events (function variant) function
CREATE OR REPLACE FUNCTION public.track_auth_events(event_type text, user_id uuid, additional_details jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    INSERT INTO public.security_audit_log (
        user_id, 
        action, 
        resource_type, 
        details
    ) VALUES (
        user_id,
        event_type,
        'authentication',
        additional_details
    );
END;
$function$;