-- Fix critical RLS policy for checklist_responses
-- Replace overly permissive policy with proper company-based access control

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Manage ChecklistResponses" ON public.checklist_responses;

-- Create proper RLS policies for checklist_responses
CREATE POLICY "Checklist responses company view"
ON public.checklist_responses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.task_checklists tc
    JOIN public.tasks t ON tc.task_id = t.id
    JOIN public.schedules s ON t.schedule_id = s.id
    WHERE tc.id = checklist_responses.checklist_id
    AND public.is_company_member(s.company_id)
  )
);

CREATE POLICY "Checklist responses company insert"
ON public.checklist_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.task_checklists tc
    JOIN public.tasks t ON tc.task_id = t.id
    JOIN public.schedules s ON t.schedule_id = s.id
    WHERE tc.id = checklist_responses.checklist_id
    AND public.is_company_member(s.company_id)
  )
);

CREATE POLICY "Checklist responses company update"
ON public.checklist_responses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.task_checklists tc
    JOIN public.tasks t ON tc.task_id = t.id
    JOIN public.schedules s ON t.schedule_id = s.id
    WHERE tc.id = checklist_responses.checklist_id
    AND public.is_company_member(s.company_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.task_checklists tc
    JOIN public.tasks t ON tc.task_id = t.id
    JOIN public.schedules s ON t.schedule_id = s.id
    WHERE tc.id = checklist_responses.checklist_id
    AND public.is_company_member(s.company_id)
  )
);

CREATE POLICY "Checklist responses company delete"
ON public.checklist_responses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.task_checklists tc
    JOIN public.tasks t ON tc.task_id = t.id
    JOIN public.schedules s ON t.schedule_id = s.id
    WHERE tc.id = checklist_responses.checklist_id
    AND public.is_company_member(s.company_id)
  )
);

-- Fix database function search_path issues for security
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