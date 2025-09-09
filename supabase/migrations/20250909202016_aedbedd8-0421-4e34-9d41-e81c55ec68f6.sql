-- Fix security vulnerability in Projects table
-- Add company_id column and proper RLS policies

-- First, add company_id column to Projects table
ALTER TABLE public."Projects" 
ADD COLUMN company_id TEXT;

-- Make company_id not null with a default for existing records
-- We'll use a placeholder company_id for any existing records
UPDATE public."Projects" 
SET company_id = 'legacy_company_' || id::text
WHERE company_id IS NULL;

-- Now make company_id required
ALTER TABLE public."Projects" 
ALTER COLUMN company_id SET NOT NULL;

-- Drop the existing insecure RLS policies
DROP POLICY IF EXISTS "Users can delete projects" ON public."Projects";
DROP POLICY IF EXISTS "Users can insert projects" ON public."Projects";  
DROP POLICY IF EXISTS "Users can update projects" ON public."Projects";
DROP POLICY IF EXISTS "Users can view projects" ON public."Projects";

-- Create secure company-based RLS policies
CREATE POLICY "Users can view company projects" 
ON public."Projects" 
FOR SELECT 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can insert company projects" 
ON public."Projects" 
FOR INSERT 
WITH CHECK (user_belongs_to_company(company_id));

CREATE POLICY "Users can update company projects" 
ON public."Projects" 
FOR UPDATE 
USING (user_belongs_to_company(company_id));

CREATE POLICY "Users can delete company projects" 
ON public."Projects" 
FOR DELETE 
USING (user_belongs_to_company(company_id));

-- Add index for better performance on company_id lookups
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON public."Projects"(company_id);