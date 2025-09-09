-- Create agent_interactions table for tracking AI agent activities
CREATE TABLE public.agent_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset_tracking table for company asset management
CREATE TABLE public.asset_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  condition TEXT DEFAULT 'good',
  purchase_date DATE,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agent_interactions (allow all for now)
CREATE POLICY "Allow all operations on agent_interactions" 
ON public.agent_interactions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create RLS policies for asset_tracking (allow all for now)
CREATE POLICY "Allow all operations on asset_tracking" 
ON public.asset_tracking 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_agent_interactions_updated_at
  BEFORE UPDATE ON public.agent_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_tracking_updated_at
  BEFORE UPDATE ON public.asset_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_agent_interactions_agent_type ON public.agent_interactions(agent_type);
CREATE INDEX idx_agent_interactions_status ON public.agent_interactions(status);
CREATE INDEX idx_asset_tracking_company_id ON public.asset_tracking(company_id);
CREATE INDEX idx_asset_tracking_status ON public.asset_tracking(status);