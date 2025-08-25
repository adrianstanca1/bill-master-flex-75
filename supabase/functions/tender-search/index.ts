import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, country = "UK", industry = "construction" } = await req.json();
    if (!query || typeof query !== "string" || query.length < 2 || query.length > 100) {
      return new Response(JSON.stringify({ error: "query is required (2-100 chars)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    // Known UK tender portals search URLs
    const endpoints = [
      { title: "Find a Tender (UK)", url: `https://www.find-tender.service.gov.uk/Search/Results?Keywords=${encodeURIComponent(query)}` },
      { title: "Contracts Finder (England)", url: `https://www.contractsfinder.service.gov.uk/Search/Results?searchType=All&keywords=${encodeURIComponent(query)}` },
      { title: "Public Contracts Scotland", url: `https://www.publiccontractsscotland.gov.uk/search/search_main.aspx?searchKeyword=${encodeURIComponent(query)}` },
      { title: "Sell2Wales", url: `https://www.sell2wales.gov.wales/search/Search_Results.aspx?searchKeyword=${encodeURIComponent(query)}` },
      { title: "eTendersNI", url: `https://etendersni.gov.uk/epps/search.do?searchString=${encodeURIComponent(query)}` }
    ];

    return new Response(JSON.stringify({ country, industry, results: endpoints }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("tender-search error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
