// Supabase Edge Function: quotes
// Provides utility endpoints for quotes, including converting a quote to an invoice.
// Uses Supabase client with JWT verification and respects RLS.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", ...corsHeaders },
    ...init,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Supabase not configured" }, { status: 500 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing Authorization header" }, { status: 401 });

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    // Support simple POST at base path for conversion
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { quoteId, number, dueDate, client } = body ?? {};
      if (!quoteId) return json({ error: "quoteId is required" }, { status: 400 });

      const { data: quote, error: qErr } = await supabase
        .from("quotes")
        .select("id, company_id, items, total, title, status")
        .eq("id", quoteId)
        .maybeSingle();
      if (qErr) return json({ error: qErr.message }, { status: 400 });
      if (!quote) return json({ error: "Quote not found" }, { status: 404 });

      const meta = {
        items: quote.items ?? [],
        source: { type: "quote", id: quote.id, title: quote.title },
      };

      // Idempotency: if an invoice was already created from this quote, return it
      const { data: existing, error: exErr } = await supabase
        .from("invoices")
        .select("id, number, total, status")
        .contains("meta", { source: { type: "quote", id: quote.id } })
        .maybeSingle();
      if (existing) {
        return json({ invoice: existing });
      }

      const { data: invoice, error: iErr } = await supabase
        .from("invoices")
        .insert({
          company_id: quote.company_id,
          total: quote.total ?? 0,
          due_date: dueDate ? new Date(dueDate).toISOString().slice(0, 10) : null,
          number: number ?? `INV-${Date.now()}`,
          client: client ?? null,
          meta,
          status: "draft",
        })
        .select("id, number, total, status")
        .maybeSingle();

      if (iErr) return json({ error: iErr.message }, { status: 400 });
      return json({ invoice });
    }

    return json({ error: "Not found" }, { status: 404 });
  } catch (e) {
    console.error("quotes function error", e);
    return json({ error: "Internal error" }, { status: 500 });
  }
});
