-- Civix: Projects, Checklists, Tools, and Task submissions schema
-- Safe to run multiple times thanks to IF NOT EXISTS and additive changes

-- Functions for RLS helpers
CREATE OR REPLACE FUNCTION public.is_project_company_member(_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_company_member(p.company_id)
  FROM public.projects p
  WHERE p.id = _project_id;
$$;

CREATE OR REPLACE FUNCTION public.is_template_company_member(_template_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_company_member(t.company_id)
  FROM public.checklist_templates t
  WHERE t.id = _template_id;
$$;

CREATE OR REPLACE FUNCTION public.is_task_company_member(_task_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_schedule_company_member(t.schedule_id)
  FROM public.tasks t
  WHERE t.id = _task_id;
$$;

CREATE OR REPLACE FUNCTION public.is_checklist_company_member(_checklist_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.is_task_company_member(tc.task_id)
  FROM public.task_checklists tc
  WHERE tc.id = _checklist_id;
$$;

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  location text,
  start_date date,
  end_date date,
  client text,
  project_manager_user_id uuid,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Projects crud"
  ON public.projects
  FOR ALL
  USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Projects view"
  ON public.projects
  FOR SELECT
  USING (public.is_company_member(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tools table
CREATE TABLE IF NOT EXISTS public.tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  type text,
  serial text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Tools crud"
  ON public.tools
  FOR ALL
  USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Tools view"
  ON public.tools
  FOR SELECT
  USING (public.is_company_member(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Project-Tools join table
CREATE TABLE IF NOT EXISTS public.project_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tool_id uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_tools ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "ProjectTools manage"
  ON public.project_tools
  FOR ALL
  USING (public.is_project_company_member(project_id))
  WITH CHECK (public.is_project_company_member(project_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "ProjectTools view"
  ON public.project_tools
  FOR SELECT
  USING (public.is_project_company_member(project_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Checklist templates
CREATE TABLE IF NOT EXISTS public.checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Checklists crud"
  ON public.checklist_templates
  FOR ALL
  USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Checklists view"
  ON public.checklist_templates
  FOR SELECT
  USING (public.is_company_member(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_checklist_templates_updated_at
  BEFORE UPDATE ON public.checklist_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Checklist items
CREATE TABLE IF NOT EXISTS public.checklist_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  idx int NOT NULL DEFAULT 0,
  question text NOT NULL,
  input_type text NOT NULL CHECK (input_type IN ('yes_no','text','numeric')),
  required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "ChecklistItems crud"
  ON public.checklist_template_items
  FOR ALL
  USING (public.is_template_company_member(template_id))
  WITH CHECK (public.is_template_company_member(template_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "ChecklistItems view"
  ON public.checklist_template_items
  FOR SELECT
  USING (public.is_template_company_member(template_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_checklist_template_items_updated_at
  BEFORE UPDATE ON public.checklist_template_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend tasks with assignment, project, checklist template, and time
DO $$ BEGIN
  ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_to uuid;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS checklist_template_id uuid REFERENCES public.checklist_templates(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS time time;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Task checklist submissions
CREATE TABLE IF NOT EXISTS public.task_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  completed_by uuid,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "TaskChecklists crud"
  ON public.task_checklists
  FOR ALL
  USING (public.is_task_company_member(task_id))
  WITH CHECK (public.is_task_company_member(task_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "TaskChecklists view"
  ON public.task_checklists
  FOR SELECT
  USING (public.is_task_company_member(task_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Checklist responses
CREATE TABLE IF NOT EXISTS public.checklist_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id uuid NOT NULL REFERENCES public.task_checklists(id) ON DELETE CASCADE,
  template_item_id uuid NOT NULL REFERENCES public.checklist_template_items(id) ON DELETE CASCADE,
  response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklist_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "ChecklistResponses crud"
  ON public.checklist_responses
  FOR ALL
  USING (public.is_checklist_company_member(checklist_id))
  WITH CHECK (public.is_checklist_company_member(checklist_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "ChecklistResponses view"
  ON public.checklist_responses
  FOR SELECT
  USING (public.is_checklist_company_member(checklist_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_projects_company ON public.projects(company_id);
CREATE INDEX IF NOT EXISTS idx_tools_company ON public.tools(company_id);
CREATE INDEX IF NOT EXISTS idx_project_tools_project ON public.project_tools(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tools_tool ON public.project_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_checklist_templates_company ON public.checklist_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_template ON public.checklist_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_template ON public.tasks(checklist_template_id);
CREATE INDEX IF NOT EXISTS idx_task_checklists_task ON public.task_checklists(task_id);
CREATE INDEX IF NOT EXISTS idx_checklist_responses_checklist ON public.checklist_responses(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_responses_item ON public.checklist_responses(template_item_id);
