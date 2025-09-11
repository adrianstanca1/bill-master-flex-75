-- Fix agent interactions monitoring by adding admin-only RLS policy
CREATE POLICY "Admins can view agent interactions" 
ON public.agent_interactions 
FOR SELECT 
USING (is_current_user_admin());

-- Create function to generate secure keys from user session
CREATE OR REPLACE FUNCTION public.get_user_encryption_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_key text;
  session_key text;
BEGIN
  -- Get user ID
  IF auth.uid() IS NULL THEN
    RETURN 'default-fallback-key-2024';
  END IF;
  
  session_key := COALESCE(
    current_setting('request.jwt.claims', true)::json->>'session_id',
    'no-session'
  );
  
  -- Generate user-specific key
  user_key := encode(
    digest(
      concat(
        auth.uid()::text,
        session_key,
        'civix-salt-2024'
      ), 
      'sha256'
    ), 
    'hex'
  );
  
  RETURN user_key;
END;
$$;

-- Create security configuration table for dynamic settings
CREATE TABLE IF NOT EXISTS public.security_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security configurations
ALTER TABLE public.security_configurations ENABLE ROW LEVEL SECURITY;

-- Only admins can manage security configurations
CREATE POLICY "Only admins can manage security configurations" 
ON public.security_configurations 
FOR ALL 
USING (is_current_user_admin());

-- Insert default security configurations
INSERT INTO public.security_configurations (setting_key, setting_value) 
VALUES 
  ('encryption_rotation_interval', '{"hours": 24}'),
  ('max_login_attempts', '{"attempts": 5, "window_minutes": 15}'),
  ('session_timeout', '{"minutes": 60}'),
  ('audit_log_retention', '{"days": 90}')
ON CONFLICT (setting_key) DO NOTHING;