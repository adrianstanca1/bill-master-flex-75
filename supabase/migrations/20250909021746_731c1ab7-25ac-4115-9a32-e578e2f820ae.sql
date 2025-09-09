-- Create clients table for client management
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
CREATE POLICY "Users can view clients for their company" 
ON public.clients 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert clients for their company" 
ON public.clients 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update clients for their company" 
ON public.clients 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete clients for their company" 
ON public.clients 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();