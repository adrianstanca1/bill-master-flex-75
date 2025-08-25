import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input schemas
const ProjectSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional().default(""),
  startDate: z.string().date().or(z.string()).optional(),
  endDate: z.string().date().or(z.string()).optional(),
  client: z.string().optional().nullable(),
  projectManagerId: z.string().uuid().optional().nullable(),
  companyId: z.string().uuid().optional(), // not in spec, but supported when multiple companies
});

const ScheduledTaskSchema = z.object({
  projectId: z.string().uuid(),
  taskName: z.string().min(1),
  frequency: z.enum(["once", "daily", "weekly", "monthly"]).or(z.string()),
  checklistTemplateId: z.string().uuid().optional().nullable(),
  assignedTo: z.string().uuid().optional().nullable(),
  startDate: z.string(),
  time: z.string().optional().nullable(),
  companyId: z.string().uuid().optional(),
});

const SubmittedChecklistSchema = z.object({
  taskId: z.string().uuid(),
  completedBy: z.string().uuid().optional(),
  responses: z.array(
    z.object({
      questionId: z.string().uuid(),
      response: z.any(),
    })
  ),
});

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname.replace(/\/+$/, "");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseKey) {
    return json({ error: "Missing Supabase credentials" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ error: "Unauthorized" }, 401);
  }
  const userId = userData.user.id;

  // Attempt to parse JSON once (for POST requests)
  let body: any = undefined;
  if (req.method !== "GET") {
    try {
      body = await req.json();
    } catch (_) {
      body = undefined;
    }
  }

  // Support both subpaths and body.route when invoking via supabase.functions.invoke
  const route = routeFrom(pathname) || (body && typeof body.route === "string" ? body.route : "");

  try {
    if (req.method === "POST" && route === "/projects") {
      return await handleCreateProject(supabase, userId, body);
    }

    if (req.method === "POST" && route === "/tasks/schedule") {
      return await handleScheduleTask(supabase, userId, body);
    }

    if (req.method === "GET" && route === "/checklists") {
      return await handleGetChecklists(supabase);
    }

    if (req.method === "POST" && route === "/checklists/submit") {
      return await handleSubmitChecklist(supabase, userId, body);
    }

    // If called with path suffix like /functions/v1/civix-api/projects
    if (req.method === "GET" && endsWith(pathname, "/checklists")) {
      return await handleGetChecklists(supabase);
    }
    if (req.method === "POST" && endsWith(pathname, "/projects")) {
      return await handleCreateProject(supabase, userId, body);
    }
    if (req.method === "POST" && endsWith(pathname, "/tasks/schedule")) {
      return await handleScheduleTask(supabase, userId, body);
    }
    if (req.method === "POST" && endsWith(pathname, "/checklists/submit")) {
      return await handleSubmitChecklist(supabase, userId, body);
    }

    return json({ error: "Route not found", route, path: pathname }, 404);
  } catch (err) {
    console.error("civix-api error:", err);
    return json({ error: "Internal error" }, 500);
  }
});

function routeFrom(pathname: string): string | "" {
  // Supabase function base ends with /functions/v1/civix-api
  const m = pathname.match(/\/functions\/v1\/civix-api(.*)$/);
  if (m && m[1]) return m[1] || "/";
  return "";
}

function endsWith(pathname: string, suffix: string) {
  return pathname.endsWith(suffix);
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getSingleCompanyId(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  preferred?: string | null
): Promise<{ companyId?: string; error?: string }> {
  if (preferred) return { companyId: preferred };

  // 1) Companies owned by user
  const { data: owned, error: ownedErr } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_user_id", userId);

  if (ownedErr) return { error: ownedErr.message };

  if (owned && owned.length === 1) return { companyId: owned[0].id };

  // 2) Companies where user is a member
  const { data: memberRows, error: memberErr } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId);

  if (memberErr) return { error: memberErr.message };

  const unique = Array.from(new Set((memberRows || []).map((r: any) => r.company_id)));

  if (unique.length === 1) return { companyId: unique[0] };

  return { error: "Multiple or no companies found. Provide companyId." };
}

async function handleCreateProject(supabase: any, userId: string, raw: any) {
  const parse = ProjectSchema.safeParse(raw);
  if (!parse.success) return json({ error: "Invalid payload", issues: parse.error.issues }, 400);
  const v = parse.data;

  const { companyId, error: companyErr } = await getSingleCompanyId(supabase, userId, v.companyId || null);
  if (!companyId) return json({ error: companyErr || "No company found for user" }, 400);

  const { data: inserted, error } = await supabase
    .from("projects")
    .insert({
      name: v.name,
      location: v.location || null,
      start_date: v.startDate ? v.startDate : null,
      end_date: v.endDate ? v.endDate : null,
      client: v.client || null,
      project_manager_user_id: v.projectManagerId || null,
      company_id: companyId,
    })
    .select("id, name, project_manager_user_id")
    .maybeSingle();

  if (error) return json({ error: error.message }, 400);
  if (!inserted) return json({ error: "Insert failed" }, 400);

  // Auto-generate baseline schedules based on simple heuristics
  const pname = (v.name || "").toLowerCase();
  const startDate = v.startDate || new Date().toISOString().slice(0, 10);
  const assignedTo = v.projectManagerId || inserted.project_manager_user_id || null;

  const seeds: Array<{ taskName: string; frequency: string; time: string; checklistTemplateId?: string | null }> = [
    { taskName: "Toolbox Talk", frequency: "daily", time: "08:00", checklistTemplateId: null },
  ];
  if (pname.includes("scaffold")) {
    seeds.push({ taskName: "Scaffold Inspection", frequency: "weekly", time: "09:00", checklistTemplateId: null });
  }
  if (pname.includes("roof")) {
    seeds.push({ taskName: "Daily Fall Protection Check", frequency: "daily", time: "08:15", checklistTemplateId: null });
  }

  let created = 0;
  for (const s of seeds) {
    const { data: schedule, error: schErr } = await supabase
      .from("schedules")
      .insert({
        company_id: companyId,
        cadence: s.frequency,
        scope: "project",
        created_by: userId,
        criteria: {
          projectId: inserted.id,
          checklistTemplateId: s.checklistTemplateId || null,
          assignedTo,
          startDate,
          time: s.time,
          taskName: s.taskName,
        },
      })
      .select("id")
      .maybeSingle();
    if (schErr || !schedule) continue;

    const { error: tErr } = await supabase
      .from("tasks")
      .insert({
        schedule_id: schedule.id,
        due_on: startDate,
        time: s.time,
        kind: s.taskName,
        project_id: inserted.id,
        checklist_template_id: s.checklistTemplateId || null,
        assigned_to: assignedTo,
        status: "pending",
      });
    if (!tErr) created++;
  }

  return json({ id: inserted.id, message: "Project created", schedulesCreated: created }, 201);
}

async function handleScheduleTask(supabase: any, userId: string, raw: any) {
  const parse = ScheduledTaskSchema.safeParse(raw);
  if (!parse.success) return json({ error: "Invalid payload", issues: parse.error.issues }, 400);
  const v = parse.data;

  const { companyId, error: companyErr } = await getSingleCompanyId(supabase, userId, v.companyId || null);
  if (!companyId) return json({ error: companyErr || "No company found for user" }, 400);

  // Create schedule first
  const { data: schedule, error: schErr } = await supabase
    .from("schedules")
    .insert({
      company_id: companyId,
      cadence: v.frequency,
      scope: "project",
      created_by: userId,
      criteria: {
        projectId: v.projectId,
        checklistTemplateId: v.checklistTemplateId || null,
        assignedTo: v.assignedTo || null,
        startDate: v.startDate,
        time: v.time || null,
        taskName: v.taskName,
      },
    })
    .select("id")
    .maybeSingle();

  if (schErr) return json({ error: schErr.message }, 400);
  if (!schedule) return json({ error: "Failed to create schedule" }, 400);

  // Then create the initial task occurrence
  const { data: task, error: tErr } = await supabase
    .from("tasks")
    .insert({
      schedule_id: schedule.id,
      due_on: v.startDate,
      time: v.time || null,
      kind: v.taskName,
      project_id: v.projectId,
      checklist_template_id: v.checklistTemplateId || null,
      assigned_to: v.assignedTo || null,
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  if (tErr) return json({ error: tErr.message }, 400);
  if (!task) return json({ error: "Failed to create task" }, 400);

  return json({ id: task.id, scheduleId: schedule.id, message: "Task scheduled" }, 201);
}

async function handleGetChecklists(supabase: any) {
  const { data: templates, error: tErr } = await supabase
    .from("checklist_templates")
    .select("id, name");
  if (tErr) return json({ error: tErr.message }, 400);

  const ids = (templates || []).map((t: any) => t.id);
  if (ids.length === 0) return json([]);

  const { data: items, error: iErr } = await supabase
    .from("checklist_template_items")
    .select("id, template_id, question, input_type, required, idx")
    .in("template_id", ids);
  if (iErr) return json({ error: iErr.message }, 400);

  const byTemplate: Record<string, any[]> = {};
  for (const it of items || []) {
    (byTemplate[it.template_id] ||= []).push({
      id: it.id,
      question: it.question,
      type: it.input_type,
      required: it.required,
      idx: it.idx,
    });
  }

  const result = (templates || []).map((t: any) => ({ id: t.id, name: t.name, items: (byTemplate[t.id] || []).sort((a, b) => a.idx - b.idx) }));
  return json(result);
}

async function handleSubmitChecklist(supabase: any, userId: string, raw: any) {
  const parse = SubmittedChecklistSchema.safeParse(raw);
  if (!parse.success) return json({ error: "Invalid payload", issues: parse.error.issues }, 400);
  const v = parse.data;

  const completedBy = v.completedBy || userId;

  const { data: checklist, error: cErr } = await supabase
    .from("task_checklists")
    .insert({ task_id: v.taskId, completed_by: completedBy })
    .select("id")
    .maybeSingle();

  if (cErr) return json({ error: cErr.message }, 400);
  if (!checklist) return json({ error: "Failed to create checklist record" }, 400);

  if (v.responses?.length) {
    const payload = v.responses.map((r) => ({
      checklist_id: checklist.id,
      template_item_id: r.questionId,
      response: r.response,
    }));

    const { error: rErr } = await supabase.from("checklist_responses").insert(payload);
    if (rErr) return json({ error: rErr.message }, 400);
  }

  return json({ id: checklist.id, message: "Checklist submitted" });
}
