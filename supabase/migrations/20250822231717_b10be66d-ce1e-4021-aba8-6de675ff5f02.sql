-- Fix remaining functions that need secure search_path

CREATE OR REPLACE FUNCTION public.is_project_company_member(_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT public.is_company_member(p.company_id)
  FROM public.projects p
  WHERE p.id = _project_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_template_company_member(_template_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT public.is_company_member(t.company_id)
  FROM public.checklist_templates t
  WHERE t.id = _template_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_task_company_member(_task_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT public.is_schedule_company_member(t.schedule_id)
  FROM public.tasks t
  WHERE t.id = _task_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_checklist_company_member(_checklist_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT public.is_task_company_member(tc.task_id)
  FROM public.task_checklists tc
  WHERE tc.id = _checklist_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_schedule_company_member(_schedule_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT public.is_company_member(s.company_id)
  FROM public.schedules s
  WHERE s.id = _schedule_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_invoice_company_member(_invoice_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT public.is_company_member(i.company_id)
  FROM public.invoices i
  WHERE i.id = _invoice_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_tender_company_member(_tender_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT public.is_company_member(t.company_id)
  FROM public.tenders t
  WHERE t.id = _tender_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE(id uuid, first_name text, last_name text, avatar_url text, phone text, company_id uuid, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.phone,
    p.company_id,
    p.role,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_setup_complete()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT COALESCE(
    (SELECT company_id IS NOT NULL FROM public.profiles WHERE id = auth.uid()),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT auth.uid() IS NOT NULL;
$function$;