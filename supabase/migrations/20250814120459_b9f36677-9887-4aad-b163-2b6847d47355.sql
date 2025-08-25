-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.company_members m
      WHERE m.company_id = _company_id
        AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_company_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = _company_id
        AND c.owner_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.company_members m
      WHERE m.company_id = _company_id
        AND m.user_id = auth.uid()
        AND m.role = 'admin'
    )
  );
$function$;

-- Add webhook table for better webhook management
CREATE TABLE IF NOT EXISTS public.webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  endpoint_url text NOT NULL,
  event_type text NOT NULL,
  secret_key text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_triggered timestamp with time zone,
  retry_count integer DEFAULT 0
);

-- Enable RLS on webhooks table
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Create policies for webhooks
CREATE POLICY "Webhooks company access" 
ON public.webhooks 
FOR ALL 
USING (is_company_admin(company_id))
WITH CHECK (is_company_admin(company_id));

-- Add updated_at trigger for webhooks
CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();