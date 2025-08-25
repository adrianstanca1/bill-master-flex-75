-- Enable leaked password protection for better security
-- This enables checking passwords against known leaked password databases
-- Note: This is a Supabase Auth configuration that should be enabled in the dashboard
-- For now, we'll document it in a comment as it requires dashboard configuration

-- Create a security reminder log entry
INSERT INTO public.security_audit_log (
  user_id,
  action,
  resource_type,
  details
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,  -- System user
  'SECURITY_RECOMMENDATION',
  'auth_configuration',
  jsonb_build_object(
    'recommendation', 'Enable leaked password protection in Supabase Auth settings',
    'priority', 'high',
    'category', 'password_security',
    'timestamp', now()
  )
);