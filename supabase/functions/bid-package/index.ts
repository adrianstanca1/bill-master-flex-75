import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, details } = await req.json();
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI key not configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let scraped = "";
    if (url && FIRECRAWL_API_KEY) {
      const r = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FIRECRAWL_API_KEY}` },
        body: JSON.stringify({ url, formats: ["markdown"] }),
      });
      const j = await r.json();
      scraped = j?.data?.markdown || "";
    }

    const prompt = `Create a bid package for a UK construction SME. Include: (1) cover_letter addressed generically, (2) compliance_checklist as an array (RAMS, H&S, insurance, references, method statements), (3) summary of requirements. Use British English. Keep it concise and professional.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You return only valid JSON." },
          { role: "user", content: `${prompt}\n\nContext notes (optional): ${details || ""}\n\nTender text (optional):\n${scraped}` }
        ],
        temperature: 0.2,
      }),
    });

    const data = await openaiRes.json();
    let parsed: any = {};
    try {
      const content = data?.choices?.[0]?.message?.content?.trim() || "{}";
      parsed = JSON.parse(content);
    } catch (_) {
      parsed = {};
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("bid-package error", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
