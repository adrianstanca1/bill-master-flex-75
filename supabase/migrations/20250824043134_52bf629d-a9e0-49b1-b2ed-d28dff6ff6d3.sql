-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'draft',
  client_name TEXT,
  client_email TEXT,
  items JSONB,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create timesheets table
CREATE TABLE IF NOT EXISTS public.timesheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID,
  project_id UUID,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  hours_worked NUMERIC,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotes
CREATE POLICY "Users can view own company quotes" ON public.quotes FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = quotes.company_id));

CREATE POLICY "Users can insert own company quotes" ON public.quotes FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = quotes.company_id));

CREATE POLICY "Users can update own company quotes" ON public.quotes FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = quotes.company_id));

CREATE POLICY "Users can delete own company quotes" ON public.quotes FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = quotes.company_id));

-- RLS Policies for timesheets
CREATE POLICY "Users can view own company timesheets" ON public.timesheets FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = timesheets.company_id));

CREATE POLICY "Users can insert own company timesheets" ON public.timesheets FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = timesheets.company_id));

CREATE POLICY "Users can update own company timesheets" ON public.timesheets FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = timesheets.company_id));

CREATE POLICY "Users can delete own company timesheets" ON public.timesheets FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = timesheets.company_id));

-- Update triggers
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON public.timesheets 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();