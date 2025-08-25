-- Create core tables for the application

-- Profiles table for user information  
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL DEFAULT gen_random_uuid(),
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Security audit log table
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Security audit log policies  
CREATE POLICY "Users can view own security logs" ON public.security_audit_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert security logs" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

-- Agent interactions table
CREATE TABLE public.agent_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  agent_type TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  content JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for agent interactions
ALTER TABLE public.agent_interactions ENABLE ROW LEVEL SECURITY;

-- Agent interactions policies
CREATE POLICY "Users can view own company agent interactions" ON public.agent_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = agent_interactions.company_id
    )
  );

CREATE POLICY "Users can insert own company agent interactions" ON public.agent_interactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = agent_interactions.company_id
    )
  );

-- Asset tracking table
CREATE TABLE public.asset_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  serial_number TEXT,
  current_location TEXT,
  status TEXT DEFAULT 'active',
  condition TEXT DEFAULT 'good',
  purchase_cost DECIMAL(10,2),
  purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for asset tracking
ALTER TABLE public.asset_tracking ENABLE ROW LEVEL SECURITY;

-- Asset tracking policies
CREATE POLICY "Users can view own company assets" ON public.asset_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = asset_tracking.company_id
    )
  );

CREATE POLICY "Users can insert own company assets" ON public.asset_tracking
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = asset_tracking.company_id
    )
  );

CREATE POLICY "Users can update own company assets" ON public.asset_tracking
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.company_id = asset_tracking.company_id
    )
  );

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_interactions_updated_at
  BEFORE UPDATE ON public.agent_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_tracking_updated_at
  BEFORE UPDATE ON public.asset_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();