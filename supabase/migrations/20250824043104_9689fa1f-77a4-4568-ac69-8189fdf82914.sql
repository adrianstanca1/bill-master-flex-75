-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  supplier TEXT,
  txn_date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  number TEXT NOT NULL,
  client TEXT NOT NULL,
  total NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expenses
CREATE POLICY "Users can view own company expenses" ON public.expenses FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = expenses.company_id));

CREATE POLICY "Users can insert own company expenses" ON public.expenses FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = expenses.company_id));

CREATE POLICY "Users can update own company expenses" ON public.expenses FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = expenses.company_id));

CREATE POLICY "Users can delete own company expenses" ON public.expenses FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = expenses.company_id));

-- RLS Policies for invoices
CREATE POLICY "Users can view own company invoices" ON public.invoices FOR SELECT 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = invoices.company_id));

CREATE POLICY "Users can insert own company invoices" ON public.invoices FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = invoices.company_id));

CREATE POLICY "Users can update own company invoices" ON public.invoices FOR UPDATE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = invoices.company_id));

CREATE POLICY "Users can delete own company invoices" ON public.invoices FOR DELETE 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = invoices.company_id));

-- Update triggers
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();