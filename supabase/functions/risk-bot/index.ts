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
    const { content } = await req.json();
    if (!content || !OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing content or OpenAI key" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const prompt = `You are RiskBot for UK construction SMEs. Analyze the provided text for risks across: financial (overpricing, missing items), compliance (UK H&S, RAMS, MEWP), contractual (payment terms), and timeline. Return strict JSON: { risks: [{ issue, category, severity (Low|Medium|High), recommendation }]}.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You return only valid JSON." },
          { role: "user", content: `${prompt}\n\nTEXT:\n${content}` }
        ],
        temperature: 0.1,
      }),
    });

    const data = await openaiRes.json();
    let risks: any[] = [];
    try {
      const content = data?.choices?.[0]?.message?.content?.trim() || "{}";
      const parsed = JSON.parse(content);
      risks = Array.isArray(parsed?.risks) ? parsed.risks : [];
    } catch (_) {
      risks = [];
    }

    return new Response(JSON.stringify({ risks }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("risk-bot error", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
