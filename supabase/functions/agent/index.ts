import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { corsHeaders } from '../_shared/cors.ts';

type InvoiceRow = {
  number: string;
  client: string;
  total: number;
  dueDate?: string;
  status: "draft" | "sent" | "paid" | "overdue";
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error("OPENAI_API_KEY not set");
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, invoices } = await req.json();

    // Input guardrails
    const rows: InvoiceRow[] = Array.isArray(invoices) ? invoices.slice(0, 200) : [];
    const text: string = typeof message === "string" ? String(message).slice(0, 2000) : "";

    // Compute quick stats for better replies and lower tokens
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    const outstanding = rows.filter(r => r.status !== "paid").reduce((s, r) => s + (Number(r.total) || 0), 0);
    const overdueList = rows.filter(r => r.status !== "paid" && r.dueDate && new Date(r.dueDate).getTime() < startOfToday);
    const overdue = overdueList.reduce((s, r) => s + (Number(r.total) || 0), 0);
    const overdueCount = overdueList.length;
    const nextDue = rows
      .filter(r => r.status !== "paid" && r.dueDate)
      .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))[0] || null;

    const stats = {
      totalInvoices: rows.length,
      outstanding,
      overdue,
      overdueCount,
      nextDue,
      overdueClients: [...new Set(overdueList.map(r => r.client))],
    };

    const system = `You are a precise but friendly finance assistant for a small business.\n\nGoals:\n- Analyze provided invoices (local-only data from the user)\n- Answer questions about overdue totals, next due dates, and cash flow\n- When asked, draft short, polite client emails (British English)\n- Keep answers concise. Use GBP formatting like £1,234.56.\n\nRules:\n- If data is missing, state assumptions clearly.\n- Never invent invoices that aren't in the list.\n- Prefer bullet points for lists.\n`;

    const userText = `User question: ${text}\n\nQuick stats: ${JSON.stringify(stats)}\n\nInvoices JSON: ${JSON.stringify(rows)}\n\nToday (UTC): ${new Date().toISOString().slice(0,10)}`;

    const payload = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userText },
      ],
      temperature: 0.3,
    };

    console.log("Invoking OpenAI with", { rows: rows.length, textLength: text.length });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a reply.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("agent function error", error?.message || error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
