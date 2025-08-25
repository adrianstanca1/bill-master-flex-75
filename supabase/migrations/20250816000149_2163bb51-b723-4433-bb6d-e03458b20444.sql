-- Fix security issues by updating policies to require authentication
-- Update all policies to use 'authenticated' role instead of allowing anonymous access

-- Fix auth.uid() check in all policies with proper auth check
ALTER POLICY "Agent interactions company access" ON public.agent_interactions TO authenticated;
ALTER POLICY "API integrations select for members" ON public.api_integrations TO authenticated;
ALTER POLICY "API integrations delete admins only" ON public.api_integrations TO authenticated;
ALTER POLICY "API integrations update admins only" ON public.api_integrations TO authenticated;
ALTER POLICY "Assets company access" ON public.asset_tracking TO authenticated;
ALTER POLICY "Business analytics company access" ON public.business_analytics TO authenticated;
ALTER POLICY "ChecklistResponses crud" ON public.checklist_responses TO authenticated;
ALTER POLICY "ChecklistResponses view" ON public.checklist_responses TO authenticated;
ALTER POLICY "ChecklistItems crud" ON public.checklist_template_items TO authenticated;
ALTER POLICY "ChecklistItems view" ON public.checklist_template_items TO authenticated;
ALTER POLICY "Checklists crud" ON public.checklist_templates TO authenticated;
ALTER POLICY "Checklists view" ON public.checklist_templates TO authenticated;
ALTER POLICY "Clients crud" ON public.clients TO authenticated;
ALTER POLICY "Clients view" ON public.clients TO authenticated;
ALTER POLICY "Companies crud" ON public.companies TO authenticated;
ALTER POLICY "Companies view" ON public.companies TO authenticated;
ALTER POLICY "Company members delete (admin only)" ON public.company_members TO authenticated;
ALTER POLICY "Company members update (admin only)" ON public.company_members TO authenticated;
ALTER POLICY "Members view" ON public.company_members TO authenticated;
ALTER POLICY "Dayworks company access" ON public.dayworks TO authenticated;
ALTER POLICY "Expenses crud" ON public.expenses TO authenticated;
ALTER POLICY "Expenses view" ON public.expenses TO authenticated;
ALTER POLICY "Invoices crud" ON public.invoices TO authenticated;
ALTER POLICY "Invoices view" ON public.invoices TO authenticated;
ALTER POLICY "Users can update their own profile" ON public.profiles TO authenticated;
ALTER POLICY "Users can view their own profile" ON public.profiles TO authenticated;
ALTER POLICY "Project assignments company access" ON public.project_assignments TO authenticated;
ALTER POLICY "Project milestones company access" ON public.project_milestones TO authenticated;
ALTER POLICY "Project status history company access" ON public.project_status_history TO authenticated;
ALTER POLICY "ProjectTools manage" ON public.project_tools TO authenticated;
ALTER POLICY "ProjectTools view" ON public.project_tools TO authenticated;
ALTER POLICY "Projects crud" ON public.projects TO authenticated;
ALTER POLICY "Projects view" ON public.projects TO authenticated;
ALTER POLICY "Quotes company access" ON public.quotes TO authenticated;
ALTER POLICY "Quotes crud" ON public.quotes TO authenticated;
ALTER POLICY "Quotes view" ON public.quotes TO authenticated;
ALTER POLICY "RAMS company access" ON public.rams_documents TO authenticated;
ALTER POLICY "Reminders company access" ON public.reminders TO authenticated;
ALTER POLICY "Retentions crud" ON public.retentions TO authenticated;
ALTER POLICY "Retentions view" ON public.retentions TO authenticated;
ALTER POLICY "Schedules crud" ON public.schedules TO authenticated;
ALTER POLICY "Schedules view" ON public.schedules TO authenticated;
ALTER POLICY "Company admins can view audit logs" ON public.security_audit_log TO authenticated;
ALTER POLICY "Site photos company access" ON public.site_photos TO authenticated;
ALTER POLICY "System health company access" ON public.system_health_checks TO authenticated;
ALTER POLICY "TaskChecklists crud" ON public.task_checklists TO authenticated;
ALTER POLICY "TaskChecklists view" ON public.task_checklists TO authenticated;
ALTER POLICY "Tasks crud" ON public.tasks TO authenticated;
ALTER POLICY "Tasks view" ON public.tasks TO authenticated;
ALTER POLICY "Tax calculations company access" ON public.tax_calculations TO authenticated;
ALTER POLICY "TenderPackages crud" ON public.tender_packages TO authenticated;
ALTER POLICY "TenderPackages view" ON public.tender_packages TO authenticated;
ALTER POLICY "Tenders crud" ON public.tenders TO authenticated;
ALTER POLICY "Tenders view" ON public.tenders TO authenticated;
ALTER POLICY "Timesheets company access" ON public.timesheets TO authenticated;
ALTER POLICY "Tools crud" ON public.tools TO authenticated;
ALTER POLICY "Tools view" ON public.tools TO authenticated;
ALTER POLICY "Variations crud" ON public.variations TO authenticated;
ALTER POLICY "Variations view" ON public.variations TO authenticated;
ALTER POLICY "VAT crud" ON public.vat_schemes TO authenticated;
ALTER POLICY "VAT view" ON public.vat_schemes TO authenticated;
ALTER POLICY "Webhooks company access" ON public.webhooks TO authenticated;

-- Fix function search path issues
ALTER FUNCTION public.calculate_project_health(uuid) SET search_path = public;