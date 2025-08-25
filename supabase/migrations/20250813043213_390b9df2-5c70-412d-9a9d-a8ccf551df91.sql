
-- Create table for quotes
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  quote_number TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  vat_rate NUMERIC NOT NULL DEFAULT 20,
  notes TEXT,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for quotes
CREATE POLICY "Quotes company access" ON public.quotes
  FOR ALL USING (is_company_member(company_id))
  WITH CHECK (is_company_member(company_id));

-- Create table for tax calculations
CREATE TABLE IF NOT EXISTS public.tax_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  calculation_type TEXT NOT NULL, -- 'income', 'corporation', 'vat', 'ni'
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  tax_year TEXT NOT NULL DEFAULT '2024/25',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for tax calculations
ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies for tax calculations
CREATE POLICY "Tax calculations company access" ON public.tax_calculations
  FOR ALL USING (is_company_member(company_id))
  WITH CHECK (is_company_member(company_id));

-- Add updated_at trigger for quotes
CREATE OR REPLACE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for tax calculations
CREATE OR REPLACE TRIGGER update_tax_calculations_updated_at
  BEFORE UPDATE ON public.tax_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for existing tables
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.invoices REPLICA IDENTITY FULL;
ALTER TABLE public.quotes REPLICA IDENTITY FULL;
ALTER TABLE public.tax_calculations REPLICA IDENTITY FULL;
ALTER TABLE public.reminders REPLICA IDENTITY FULL;
ALTER TABLE public.dayworks REPLICA IDENTITY FULL;
ALTER TABLE public.asset_tracking REPLICA IDENTITY FULL;
ALTER TABLE public.timesheets REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tax_calculations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dayworks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.asset_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.timesheets;
