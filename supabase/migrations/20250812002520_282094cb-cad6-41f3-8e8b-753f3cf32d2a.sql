
-- Create tables for system monitoring and API management
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  api_key_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  response_time INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for API integrations
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;

-- Create policy for API integrations
CREATE POLICY "API integrations company access" 
  ON public.api_integrations 
  FOR ALL 
  USING (is_company_member(company_id))
  WITH CHECK (is_company_member(company_id));

-- Create table for system health checks
CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  details JSONB DEFAULT '{}',
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for system health checks
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;

-- Create policy for system health checks
CREATE POLICY "System health company access" 
  ON public.system_health_checks 
  FOR ALL 
  USING (is_company_member(company_id))
  WITH CHECK (is_company_member(company_id));

-- Create table for agent dashboards
CREATE TABLE IF NOT EXISTS public.agent_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  user_id UUID,
  interaction_type TEXT NOT NULL,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'completed',
  duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for agent interactions
ALTER TABLE public.agent_interactions ENABLE ROW LEVEL SECURITY;

-- Create policy for agent interactions
CREATE POLICY "Agent interactions company access" 
  ON public.agent_interactions 
  FOR ALL 
  USING (is_company_member(company_id))
  WITH CHECK (is_company_member(company_id));

-- Add triggers for updated_at columns
CREATE OR REPLACE TRIGGER update_api_integrations_updated_at
  BEFORE UPDATE ON public.api_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_system_health_checks_updated_at
  BEFORE UPDATE ON public.system_health_checks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
