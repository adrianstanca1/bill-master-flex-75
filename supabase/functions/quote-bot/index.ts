import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { title = "Quote", withMaterials = true, targetMargin = 0.2, context = {} } = await req.json();

    // Basic input validation
    if (typeof title !== "string" || title.length < 1 || title.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid title" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const margin = Number(targetMargin);
    if (!Number.isFinite(margin) || margin < 0 || margin > 0.9) {
      return new Response(JSON.stringify({ error: "Invalid targetMargin" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = `Create a structured UK construction quote. Inputs: title=${title}, withMaterials=${withMaterials}, targetMargin=${targetMargin}. Return JSON with items:[{name, qty, unit, material:boolean, unit_cost, line_total}], subtotal, margin_applied, total, notes. Use fair market costs and British English.`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", temperature: 0.3, messages: [ { role: "system", content: "You are QuoteBot, a UK construction estimator." }, { role: "user", content: prompt } ] })
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("quote-bot OpenAI error", t);
      return new Response(JSON.stringify({ error: "AI request failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await aiRes.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ quote: parsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("quote-bot error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
