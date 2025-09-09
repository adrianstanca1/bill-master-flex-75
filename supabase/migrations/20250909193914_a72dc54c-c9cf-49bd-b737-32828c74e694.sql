-- Add missing RLS policies for Projects table
CREATE POLICY "Users can view projects" 
ON public."Projects" 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert projects" 
ON public."Projects" 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update projects" 
ON public."Projects" 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete projects" 
ON public."Projects" 
FOR DELETE 
USING (true);