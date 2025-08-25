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

    const { turnover12m = 0, vatScheme = "standard", reverseCharge = true, cis = true, notes = "" } = await req.json();

    const turnover = Number(turnover12m);
    if (!Number.isFinite(turnover) || turnover < 0 || turnover > 100000000) {
      return new Response(JSON.stringify({ error: "Invalid turnover12m" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (typeof vatScheme !== "string" || vatScheme.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid vatScheme" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = `You are TaxBot, a UK tax/VAT assistant for construction. Given: turnover12m=${turnover}, vatScheme=${vatScheme}, reverseCharge=${reverseCharge}, cis=${cis}. Provide:
- VAT obligations and reverse charge applicability (CIS)
- Threshold warnings (VAT registration £90k, cash accounting, flat-rate option)
- Next actions and deadlines
Format as concise bullet points in British English.`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o", temperature: 0.2, messages: [ { role: "system", content: "Expert UK VAT/CIS advisor." }, { role: "user", content: prompt } ] })
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("tax-bot OpenAI error", t);
      return new Response(JSON.stringify({ error: "AI request failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await aiRes.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ advice: content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("tax-bot error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
