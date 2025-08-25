import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function buildContractsFinderUrl(keyword: string, location: string, page = 1) {
  const q = encodeURIComponent(keyword || "");
  const loc = encodeURIComponent(location || "");
  return `https://www.contractsfinder.service.gov.uk/Search/Results?&page=${page}&q=${q}&Location=${loc}`;
}

function extractTendersFromHtml(html: string) {
  const tenders: Array<{ title: string; url: string; deadline?: string }> = [];
  const anchorRegex = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((match = anchorRegex.exec(html))) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!href || !text) continue;
    if (!href.toLowerCase().includes("/notice/")) continue; // contracts finder notice pages
    const full = href.startsWith("http")
      ? href
      : `https://www.contractsfinder.service.gov.uk${href}`;
    const key = `${text}::${full}`;
    if (seen.has(key)) continue;
    seen.add(key);
    tenders.push({ title: text, url: full });
  }

  // Try to find deadlines near date spans
  const dlRegex = /<span[^>]*class="[^"]*date[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
  const deadlines: string[] = [];
  while ((match = dlRegex.exec(html))) {
    const d = match[1].replace(/<[^>]+>/g, "").trim();
    if (d) deadlines.push(d);
  }
  for (let i = 0; i < tenders.length && i < deadlines.length; i++) {
    tenders[i].deadline = deadlines[i];
  }
  return tenders.slice(0, 50);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);

    if (!FIRECRAWL_API_KEY || !OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing FIRECRAWL_API_KEY or OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Accept both GET query params and POST body
    let keyword = searchParams.get("keyword") || "";
    let location = searchParams.get("location") || "";
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.keyword) keyword = body.keyword;
        if (body?.location) location = body.location;
      } catch (err) {
        console.error("failed to parse request body", err);
      }
    }

    const url = buildContractsFinderUrl(keyword, location, 1);

    // Use Firecrawl to scrape the page (HTML + Markdown)
    const payload = { url, formats: ["markdown", "html"] };
    const resp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Firecrawl scrape error", resp.status, t);
      return new Response(JSON.stringify({ error: "Failed to scrape source" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const html: string = data?.data?.html ?? data?.html ?? "";
    const markdown: string = data?.data?.markdown ?? data?.markdown ?? "";

    let tenders = extractTendersFromHtml(html || "");
    if (!tenders.length && markdown) {
      // fallback: parse markdown links
      const mdLink = /\[([^\]]+)\]\(([^)]+)\)/g;
      let m;
      const seen = new Set<string>();
      while ((m = mdLink.exec(markdown))) {
        const title = (m[1] || "").trim();
        const href = (m[2] || "").trim();
        if (!/contractsfinder/gi.test(href)) continue;
        const key = `${title}::${href}`;
        if (seen.has(key)) continue;
        seen.add(key);
        tenders.push({ title, url: href });
      }
      tenders = tenders.slice(0, 50);
    }

    const listText = tenders
      .map((t) => `- ${t.title}${t.deadline ? ` (Deadline: ${t.deadline})` : ""} — ${t.url}`)
      .join("\n");

    const aiPayload = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You're an AI that matches UK public sector construction tenders to companies.",
        },
        {
          role: "user",
          content:
            `Company Trade: construction\nLocation: ${location}\nRelevant Tenders:\n${listText}`,
        },
      ],
      temperature: 0.2,
    };

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(aiPayload),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("OpenAI error", aiResp.status, t);
    }
    const aiData = await aiResp.json().catch(() => ({}));
    const summary = aiData?.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ rawTenders: tenders, summary, sourceUrl: url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("tenders suggestions error", e.message);
    } else {
      console.error("tenders suggestions error", e);
    }
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
