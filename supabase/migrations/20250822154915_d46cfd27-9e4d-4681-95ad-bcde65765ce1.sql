-- Fix remaining function search path issues

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate input
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  -- Insert profile with error handling
  INSERT INTO profiles (
    id, 
    first_name, 
    last_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    now(),
    now()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.track_auth_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Log authentication event
    INSERT INTO security_audit_log (
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
$$;

CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Enhanced security event logging
    INSERT INTO security_audit_log (
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
$$;

CREATE OR REPLACE FUNCTION public.analyze_security_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Analyze security patterns in real-time
    -- This could trigger alerts for suspicious activities
    IF NEW.action IN ('LOGIN_FAILED', 'SECURITY_VIOLATION', 'UNAUTHORIZED_ACCESS') THEN
        -- Check for patterns that might indicate attacks
        PERFORM 1;  -- Placeholder for analysis logic
    END IF;
    RETURN NEW;
END;
$$;