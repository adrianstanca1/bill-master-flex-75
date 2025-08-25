import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } }
    });

    const body = await req.json().catch(() => ({}));
    const companyId: string | undefined = body.companyId;

    if (!companyId) {
      return new Response(JSON.stringify({ error: "companyId is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const uuidRe = /^[0-9a-fA-F-]{36}$/;
    if (!uuidRe.test(companyId)) {
      return new Response(JSON.stringify({ error: "Invalid companyId format" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch key datasets
    const [invoicesRes, expensesRes, tendersRes] = await Promise.all([
      supabase.from("invoices").select("id, total, due_date, status").eq("company_id", companyId),
      supabase.from("expenses").select("id, amount, txn_date, category").eq("company_id", companyId),
      supabase.from("tenders").select("id, title, deadline, status").eq("company_id", companyId),
    ]);

    const invoices = invoicesRes.data ?? [];
    const expenses = expensesRes.data ?? [];
    const tenders = tendersRes.data ?? [];

    // Basic analytics
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const overdue = invoices.filter((i) => i.status !== "paid" && i.due_date && new Date(i.due_date) < startOfToday);
    const overdueTotal = overdue.reduce((s, i) => s + Number(i.total || 0), 0);

    const next30 = new Date();
    next30.setDate(next30.getDate() + 30);

    // Heuristic cashflow (very rough)
    const unpaid = invoices.filter((i) => i.status !== "paid");
    const unpaidTotal = unpaid.reduce((s, i) => s + Number(i.total || 0), 0);
    const spend30 = expenses
      .filter((e) => new Date(e.txn_date) >= startOfToday && new Date(e.txn_date) <= next30)
      .reduce((s, e) => s + Number(e.amount || 0), 0);

    // Compose suggestions with OpenAI (optional)
    let aiAdvice: string | undefined;
    if (OPENAI_API_KEY) {
      const prompt = `You are AccountsBot+OpsBot for a small UK construction company.\nData summary: overdue invoices: ${overdue.length} (£${overdueTotal.toFixed(2)}), unpaid total: £${unpaidTotal.toFixed(2)}, next-30d spend (observed): £${spend30.toFixed(2)}, tenders tracked: ${tenders.length}.\nProvide 5 concise actionable recommendations about cash flow risk, overdue follow-ups, pricing, tender focus, and missing documents. British English.`;
      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o", temperature: 0.3, messages: [ { role: "system", content: "You are a proactive UK construction business advisor." }, { role: "user", content: prompt } ] })
      });
      if (aiRes.ok) {
        const data = await aiRes.json();
        aiAdvice = data.choices?.[0]?.message?.content;
      }
    }

    const result = {
      kpis: {
        overdueCount: overdue.length,
        overdueTotal,
        unpaidTotal,
        expensesNext30: spend30,
        tendersCount: tenders.length,
      },
      suggestions: [
        overdue.length > 0 ? `Follow up on ${overdue.length} overdue invoices (≈£${overdueTotal.toFixed(0)}).` : "No overdue invoices detected.",
        spend30 > 0 ? `Review upcoming spend (£${spend30.toFixed(0)}) vs. expected receipts.` : "No upcoming expenses recorded.",
        tenders.length > 0 ? `Prioritise ${tenders.filter(t=>t.status==='qualified').length || 'top'} qualified tenders this week.` : "Add tenders to track opportunities.",
        "Ensure VAT scheme settings (e.g., reverse charge) are correct for current jobs.",
        "Schedule Toolbox Talks and RAMS updates for active sites.",
      ],
      aiAdvice,
      generatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("smartops error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
