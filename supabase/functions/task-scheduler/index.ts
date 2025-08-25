import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require secret gate for all calls (no JWT)
    const CRON_SECRET = Deno.env.get("CRON_SECRET") || "";
    const provided = req.headers.get("x-cron-secret") || req.headers.get("x-cron-key") || "";
    // Constant-time compare to mitigate timing attacks
    const safeEqual = (a: string, b: string) => {
      const enc = new TextEncoder();
      const aBytes = enc.encode(a);
      const bBytes = enc.encode(b);
      if (aBytes.length !== bBytes.length) return false;
      let result = 0;
      for (let i = 0; i < aBytes.length; i++) {
        result |= aBytes[i] ^ bBytes[i];
      }
      return result === 0;
    };
    if (!CRON_SECRET || !provided || !safeEqual(provided, CRON_SECRET)) {
      console.warn("task-scheduler forbidden request");
      return json({ error: "Forbidden" }, 403);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "Missing Supabase credentials" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const weekday = today.getUTCDay(); // 0-6
    const dayOfMonth = today.getUTCDate();

    // Fetch active schedules
    const { data: schedules, error: sErr } = await supabase
      .from("schedules")
      .select("id, cadence, criteria")
      .in("cadence", ["daily", "weekly", "monthly"]);
    if (sErr) return json({ error: sErr.message }, 500);

    let considered = 0;
    let created = 0;

    for (const sch of schedules || []) {
      const c = (sch as any).criteria || {};
      const startDate = (c.startDate as string) || todayStr;
      if (startDate > todayStr) continue; // not yet active

      let dueToday = false;
      if (sch.cadence === "daily") dueToday = true;
      else if (sch.cadence === "weekly") {
        const startDow = new Date(startDate + "T00:00:00Z").getUTCDay();
        dueToday = startDow === weekday;
      } else if (sch.cadence === "monthly") {
        const startDom = new Date(startDate + "T00:00:00Z").getUTCDate();
        dueToday = startDom === dayOfMonth;
      }

      if (!dueToday) continue;
      considered++;

      // Skip if already exists
      const { count, error: existErr } = await supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("schedule_id", sch.id)
        .eq("due_on", todayStr);
      if (existErr) continue;
      if ((count || 0) > 0) continue;

      const taskPayload: Record<string, any> = {
        schedule_id: sch.id,
        due_on: todayStr,
        time: c.time || null,
        kind: c.taskName || "Scheduled Task",
        project_id: c.projectId || null,
        checklist_template_id: c.checklistTemplateId || null,
        assigned_to: c.assignedTo || null,
        status: "pending",
      };

      const { error: insErr } = await supabase.from("tasks").insert(taskPayload);
      if (!insErr) created++;
    }

    return json({ date: todayStr, considered, created });
  } catch (err) {
    console.error("task-scheduler error", err);
    return json({ error: "Internal error" }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
