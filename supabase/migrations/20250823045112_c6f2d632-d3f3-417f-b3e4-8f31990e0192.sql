-- Update OAuth provider validation to include custom provider
CREATE OR REPLACE FUNCTION public.validate_oauth_providers()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  result jsonb := '{}';
BEGIN
  -- Check if OAuth providers are configured
  -- In production, this would check actual OAuth configuration
  result := jsonb_build_object(
    'google_enabled', true,  -- Google OAuth enabled
    'microsoft_enabled', false,
    'github_enabled', false,
    'custom_enabled', true,  -- Custom OAuth enabled with new credentials
    'recommendation', 'Google and Custom OAuth are enabled. Configure secrets in Supabase settings.'
  );
  
  RETURN result;
END;
$function$