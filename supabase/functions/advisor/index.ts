import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { message, context } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'message' string" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `You are Civix Business Advisor & Supervisor. Be proactive and pragmatic. 
- Identify risks (cash flow, overdue invoices, tenders, compliance, scheduling) and prioritise by impact.
- Propose 30/60/90-day plan, measurable KPIs, and owners.
- Suggest checklists/schedules to operationalise improvements.
- Offer brief email or policy drafts when relevant.
Keep answers structured with headings and concise bullet points.`;

    const body = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify({ message, context: context || {} }) },
      ],
      temperature: 0.3,
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("advisor openai error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI call failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("advisor function error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
