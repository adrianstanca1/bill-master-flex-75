-- Fix remaining database functions with search_path security

-- Fix: update_updated_at_column function
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

-- Fix: no_public_access function
CREATE OR REPLACE FUNCTION public.no_public_access()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    RETURN FALSE;
END;
$function$;

-- Fix: calculate_project_health function
CREATE OR REPLACE FUNCTION public.calculate_project_health(project_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  health_score NUMERIC := 100;
  project_data RECORD;
  days_overdue INTEGER;
  budget_variance NUMERIC;
BEGIN
  -- Get project data
  SELECT * INTO project_data 
  FROM public.projects 
  WHERE id = project_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Check if project is overdue
  IF project_data.end_date IS NOT NULL AND project_data.end_date < CURRENT_DATE THEN
    days_overdue := CURRENT_DATE - project_data.end_date;
    health_score := health_score - (days_overdue * 2);
  END IF;
  
  -- Check budget variance
  IF project_data.budget > 0 AND project_data.spent > 0 THEN
    budget_variance := (project_data.spent / project_data.budget) * 100;
    IF budget_variance > 100 THEN
      health_score := health_score - (budget_variance - 100);
    END IF;
  END IF;
  
  -- Check progress vs time elapsed
  IF project_data.start_date IS NOT NULL AND project_data.end_date IS NOT NULL THEN
    DECLARE
      total_days INTEGER := project_data.end_date - project_data.start_date;
      elapsed_days INTEGER := CURRENT_DATE - project_data.start_date;
      expected_progress NUMERIC;
    BEGIN
      IF total_days > 0 AND elapsed_days > 0 THEN
        expected_progress := (elapsed_days::NUMERIC / total_days) * 100;
        IF project_data.progress < expected_progress THEN
          health_score := health_score - (expected_progress - project_data.progress);
        END IF;
      END IF;
    END;
  END IF;
  
  RETURN GREATEST(health_score, 0);
END;
$function$;

-- Fix: analyze_security_events function (main one)
CREATE OR REPLACE FUNCTION public.analyze_security_events(p_interval interval DEFAULT '24:00:00'::interval, p_severity text DEFAULT 'warning'::text)
 RETURNS TABLE(event_summary jsonb, total_events bigint, unique_users bigint, top_sources jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    RETURN QUERY
    WITH event_analysis AS (
        SELECT 
            jsonb_build_object(
                'event_type', event_type,
                'severity', severity,
                'count', COUNT(*),
                'first_occurrence', MIN(created_at),
                'last_occurrence', MAX(created_at)
            ) AS event_summary,
            COUNT(*) AS total_events,
            COUNT(DISTINCT user_id) AS unique_users,
            jsonb_agg(
                jsonb_build_object(
                    'ip_address', ip_address::text, 
                    'count', COUNT(*)
                )
            ) AS top_sources
        FROM public.security_events
        WHERE created_at > NOW() - p_interval
          AND severity >= p_severity
        GROUP BY event_type, severity
    )
    SELECT 
        event_summary, 
        total_events, 
        unique_users,
        top_sources
    FROM event_analysis;
END;
$function$;

-- Fix: log_security_event function (main one)
CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_severity text DEFAULT 'info'::text, p_user_id uuid DEFAULT NULL::uuid, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_request_path text DEFAULT NULL::text, p_request_method text DEFAULT NULL::text, p_details jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    event_id uuid;
BEGIN
    INSERT INTO public.security_events (
        event_type, 
        severity,
        user_id,
        ip_address,
        user_agent,
        request_path,
        request_method,
        client_info,
        details
    ) VALUES (
        p_event_type,
        p_severity,
        p_user_id,
        p_ip_address,
        p_user_agent,
        p_request_path,
        p_request_method,
        jsonb_build_object(
            'user_agent', p_user_agent,
            'ip_address', p_ip_address::text
        ),
        p_details
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$function$;