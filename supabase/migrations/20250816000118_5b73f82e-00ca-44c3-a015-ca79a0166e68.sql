-- Add project progress tracking and status updates
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planning';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS budget NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS spent NUMERIC DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS estimated_completion DATE;

-- Add project team assignments
CREATE TABLE IF NOT EXISTS public.project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID,
  company_id UUID NOT NULL
);

-- Enable RLS on project assignments
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

-- Project assignments policies
CREATE POLICY "Project assignments company access" 
ON public.project_assignments 
FOR ALL 
USING (is_company_member(company_id))
WITH CHECK (is_company_member(company_id));

-- Add project status history for tracking changes
CREATE TABLE IF NOT EXISTS public.project_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  company_id UUID NOT NULL
);

-- Enable RLS on project status history
ALTER TABLE public.project_status_history ENABLE ROW LEVEL SECURITY;

-- Project status history policies
CREATE POLICY "Project status history company access" 
ON public.project_status_history 
FOR ALL 
USING (is_company_member(company_id))
WITH CHECK (is_company_member(company_id));

-- Add project milestones
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID,
  company_id UUID NOT NULL
);

-- Enable RLS on project milestones
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- Project milestones policies
CREATE POLICY "Project milestones company access" 
ON public.project_milestones 
FOR ALL 
USING (is_company_member(company_id))
WITH CHECK (is_company_member(company_id));

-- Create business analytics table for advanced reporting
CREATE TABLE IF NOT EXISTS public.business_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on business analytics
ALTER TABLE public.business_analytics ENABLE ROW LEVEL SECURITY;

-- Business analytics policies
CREATE POLICY "Business analytics company access" 
ON public.business_analytics 
FOR ALL 
USING (is_company_member(company_id))
WITH CHECK (is_company_member(company_id));

-- Add updated_at triggers for new tables
CREATE TRIGGER update_project_assignments_updated_at
BEFORE UPDATE ON public.project_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate project health score
CREATE OR REPLACE FUNCTION public.calculate_project_health(project_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  health_score NUMERIC := 100;
  project_data RECORD;
  days_overdue INTEGER;
  budget_variance NUMERIC;
BEGIN
  -- Get project data
  SELECT * INTO project_data 
  FROM public.projects 
  WHERE id = project_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Check if project is overdue
  IF project_data.end_date IS NOT NULL AND project_data.end_date < CURRENT_DATE THEN
    days_overdue := CURRENT_DATE - project_data.end_date;
    health_score := health_score - (days_overdue * 2); -- Reduce 2 points per day overdue
  END IF;
  
  -- Check budget variance
  IF project_data.budget > 0 AND project_data.spent > 0 THEN
    budget_variance := (project_data.spent / project_data.budget) * 100;
    IF budget_variance > 100 THEN
      health_score := health_score - (budget_variance - 100); -- Reduce points for budget overrun
    END IF;
  END IF;
  
  -- Check progress vs time elapsed
  IF project_data.start_date IS NOT NULL AND project_data.end_date IS NOT NULL THEN
    DECLARE
      total_days INTEGER := project_data.end_date - project_data.start_date;
      elapsed_days INTEGER := CURRENT_DATE - project_data.start_date;
      expected_progress NUMERIC;
    BEGIN
      IF total_days > 0 AND elapsed_days > 0 THEN
        expected_progress := (elapsed_days::NUMERIC / total_days) * 100;
        IF project_data.progress < expected_progress THEN
          health_score := health_score - (expected_progress - project_data.progress);
        END IF;
      END IF;
    END;
  END IF;
  
  -- Ensure score doesn't go below 0
  RETURN GREATEST(health_score, 0);
END;
$$;