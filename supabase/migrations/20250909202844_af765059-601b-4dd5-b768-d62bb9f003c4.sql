-- Update authentication configuration for better security
-- Configure shorter OTP expiry times

-- Note: Some auth configuration changes need to be done via the Supabase Dashboard
-- This migration documents the recommended settings that should be applied manually

-- Create a settings documentation table for reference
CREATE TABLE IF NOT EXISTS public.recommended_auth_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_name text NOT NULL,
    recommended_value text NOT NULL,
    current_status text DEFAULT 'pending',
    description text,
    created_at timestamp with time zone DEFAULT now()
);

-- Insert recommended auth settings for reference
INSERT INTO public.recommended_auth_settings (setting_name, recommended_value, description) VALUES
('email_otp_expiry', '600', 'Email OTP should expire in 10 minutes (600 seconds) for security'),
('sms_otp_expiry', '300', 'SMS OTP should expire in 5 minutes (300 seconds) for security'),
('magic_link_expiry', '3600', 'Magic links should expire in 1 hour (3600 seconds) for security'),
('postgres_version', 'latest', 'Postgres should be upgraded to latest version for security patches');

-- Enable RLS on this reference table
ALTER TABLE public.recommended_auth_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow viewing these settings
CREATE POLICY "Allow viewing auth settings recommendations" 
ON public.recommended_auth_settings 
FOR SELECT 
USING (true);