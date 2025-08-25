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
    const { keywords, location = "UK", limit = 10 } = await req.json();
    if (!keywords || !OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing keywords or OpenAI key" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let scrapedText = "";
    if (FIRECRAWL_API_KEY) {
      const sources = [
        "https://www.gov.uk/business-finance-support",
        "https://www.gov.uk/government/collections/uk-innovation-and-research-support",
      ];
      const scrapeResponses = await Promise.all(
        sources.map((url) => fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${FIRECRAWL_API_KEY}` },
          body: JSON.stringify({ url, formats: ["markdown"] }),
        }))
      );
      const parts = await Promise.all(scrapeResponses.map((r) => r.ok ? r.json() : null));
      scrapedText = parts
        .map((p: any) => p?.data?.markdown || "")
        .filter(Boolean)
        .join("\n\n");
    }

    const prompt = `You are FundingBot helping UK construction SMEs. Given keywords: ${keywords} in ${location}. From the provided context (may be empty), extract or infer up to ${limit} current grants or schemes. Return strict JSON with field grants: [{title, url, deadline, amount, relevance}]. Relevance is 0-100 based on ${keywords}. If unknown, leave fields null.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You return only valid JSON." },
          { role: "user", content: `${prompt}\n\nCONTEXT (markdown):\n${scrapedText}` }
        ],
        temperature: 0.2,
      }),
    });

    const data = await openaiRes.json();
    let grants: any[] = [];
    try {
      const content = data?.choices?.[0]?.message?.content?.trim() || "{}";
      const parsed = JSON.parse(content);
      grants = Array.isArray(parsed?.grants) ? parsed.grants : [];
    } catch (_) {
      // Fallback: try to coerce
      grants = [];
    }

    return new Response(JSON.stringify({ grants }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("funding-bot error", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
