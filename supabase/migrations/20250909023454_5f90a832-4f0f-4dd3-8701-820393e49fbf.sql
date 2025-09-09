-- Fix critical RLS policies for security vulnerabilities

-- 1. Fix employees table - remove dangerous "Allow all operations" policy
DROP POLICY IF EXISTS "Allow all operations on employees" ON public.employees;

-- Create secure company-based policies for employees
CREATE POLICY "Users can view company employees" 
ON public.employees 
FOR SELECT 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can insert company employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (user_belongs_to_company(company_id));

CREATE POLICY "Users can update company employees" 
ON public.employees 
FOR UPDATE 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can delete company employees" 
ON public.employees 
FOR DELETE 
USING (user_belongs_to_company(company_id));

-- 2. Fix clients table - remove dangerous "true" condition policies
DROP POLICY IF EXISTS "Users can delete clients for their company" ON public.clients;
DROP POLICY IF EXISTS "Users can insert clients for their company" ON public.clients;
DROP POLICY IF EXISTS "Users can update clients for their company" ON public.clients;
DROP POLICY IF EXISTS "Users can view clients for their company" ON public.clients;

-- Create secure company-based policies for clients
CREATE POLICY "Users can view company clients" 
ON public.clients 
FOR SELECT 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can insert company clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (user_belongs_to_company(company_id));

CREATE POLICY "Users can update company clients" 
ON public.clients 
FOR UPDATE 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can delete company clients" 
ON public.clients 
FOR DELETE 
USING (user_belongs_to_company(company_id));

-- 3. Fix expenses table - remove dangerous "Allow all operations" policy
DROP POLICY IF EXISTS "Allow all operations on expenses" ON public.expenses;

-- Create secure company-based policies for expenses
CREATE POLICY "Users can view company expenses" 
ON public.expenses 
FOR SELECT 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can insert company expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (user_belongs_to_company(company_id));

CREATE POLICY "Users can update company expenses" 
ON public.expenses 
FOR UPDATE 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can delete company expenses" 
ON public.expenses 
FOR DELETE 
USING (user_belongs_to_company(company_id));

-- 4. Fix invoices table - remove dangerous "Allow all operations" policy
DROP POLICY IF EXISTS "Allow all operations on invoices" ON public.invoices;

-- Create secure company-based policies for invoices
CREATE POLICY "Users can view company invoices" 
ON public.invoices 
FOR SELECT 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can insert company invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (user_belongs_to_company(company_id));

CREATE POLICY "Users can update company invoices" 
ON public.invoices 
FOR UPDATE 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can delete company invoices" 
ON public.invoices 
FOR DELETE 
USING (user_belongs_to_company(company_id));

-- 5. Fix agent_interactions table - restrict to system administrators only
DROP POLICY IF EXISTS "Allow all operations on agent_interactions" ON public.agent_interactions;

-- Create restrictive policies for agent_interactions (system use only)
CREATE POLICY "System can insert agent interactions" 
ON public.agent_interactions 
FOR INSERT 
WITH CHECK (true); -- Allow system inserts but restrict reads

-- Only authenticated users can view their own interactions (if we add user_id later)
CREATE POLICY "Users cannot view agent interactions" 
ON public.agent_interactions 
FOR SELECT 
USING (false); -- Block all reads for now

-- 6. Fix Vote_v2 table - remove dangerous "true" condition policies
DROP POLICY IF EXISTS "Users can create votes" ON public."Vote_v2";
DROP POLICY IF EXISTS "Users can delete votes" ON public."Vote_v2";
DROP POLICY IF EXISTS "Users can update votes" ON public."Vote_v2";
DROP POLICY IF EXISTS "Users can view votes" ON public."Vote_v2";

-- Create secure chat-based policies for Vote_v2
CREATE POLICY "Users can view votes from their chats" 
ON public."Vote_v2" 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM "Chat" 
    WHERE "Chat".id = "Vote_v2"."chatId" 
    AND "Chat"."userId" = auth.uid()
));

CREATE POLICY "Users can insert votes to their chats" 
ON public."Vote_v2" 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM "Chat" 
    WHERE "Chat".id = "Vote_v2"."chatId" 
    AND "Chat"."userId" = auth.uid()
));

CREATE POLICY "Users can update votes in their chats" 
ON public."Vote_v2" 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM "Chat" 
    WHERE "Chat".id = "Vote_v2"."chatId" 
    AND "Chat"."userId" = auth.uid()
));

CREATE POLICY "Users can delete votes from their chats" 
ON public."Vote_v2" 
FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM "Chat" 
    WHERE "Chat".id = "Vote_v2"."chatId" 
    AND "Chat"."userId" = auth.uid()
));

-- 7. Create quotes table for MockQuoteTester
CREATE TABLE IF NOT EXISTS public.quotes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id text NOT NULL,
    title text NOT NULL,
    items jsonb DEFAULT '[]'::jsonb,
    total numeric NOT NULL DEFAULT 0,
    status text DEFAULT 'draft'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on quotes table
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create secure company-based policies for quotes
CREATE POLICY "Users can view company quotes" 
ON public.quotes 
FOR SELECT 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can insert company quotes" 
ON public.quotes 
FOR INSERT 
WITH CHECK (user_belongs_to_company(company_id));

CREATE POLICY "Users can update company quotes" 
ON public.quotes 
FOR UPDATE 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can delete company quotes" 
ON public.quotes 
FOR DELETE 
USING (user_belongs_to_company(company_id));

-- Add trigger for updated_at
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();