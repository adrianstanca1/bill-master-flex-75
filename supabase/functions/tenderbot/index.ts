import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!FIRECRAWL_API_KEY) {
      console.error("FIRECRAWL_API_KEY not set");
      return new Response(JSON.stringify({ error: "Missing FIRECRAWL_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { url, mode = "crawl", limit = 50 } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate URL and parameters
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (parsed.protocol !== "https:") {
      return new Response(JSON.stringify({ error: "Only https URLs are allowed" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const safeLimit = Math.max(1, Math.min(Number(limit) || 1, 50));
    const safeMode = mode === "scrape" ? "scrape" : "crawl";

    const endpoint = safeMode === "scrape" ? "https://api.firecrawl.dev/v1/scrape" : "https://api.firecrawl.dev/v1/crawl";
    const payload = safeMode === "scrape"
      ? { url: parsed.toString(), formats: ["markdown", "html"] }
      : { url: parsed.toString(), limit: safeLimit, scrapeOptions: { formats: ["markdown", "html"] } };

    console.log("Firecrawl request", { endpoint, mode, url, limit });

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Firecrawl error:", resp.status, t);
      return new Response(JSON.stringify({ error: "Firecrawl request failed", status: resp.status }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("tenderbot function error", error?.message || error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
