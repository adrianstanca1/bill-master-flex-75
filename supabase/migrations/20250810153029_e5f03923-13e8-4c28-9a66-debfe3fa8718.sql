-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients crud"
ON public.clients
AS RESTRICTIVE
FOR ALL
USING (public.is_company_member(company_id))
WITH CHECK (public.is_company_member(company_id));

CREATE POLICY "Clients view"
ON public.clients
AS RESTRICTIVE
FOR SELECT
USING (public.is_company_member(company_id));

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create variations (change orders) table
CREATE TABLE IF NOT EXISTS public.variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.variations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variations crud"
ON public.variations
AS RESTRICTIVE
FOR ALL
USING (public.is_project_company_member(project_id))
WITH CHECK (public.is_project_company_member(project_id));

CREATE POLICY "Variations view"
ON public.variations
AS RESTRICTIVE
FOR SELECT
USING (public.is_project_company_member(project_id));

CREATE TRIGGER update_variations_updated_at
BEFORE UPDATE ON public.variations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_clients_company ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_variations_project ON public.variations(project_id);
