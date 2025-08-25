import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function analyzeInvoiceForRisks(invoice: {
  reverse_vat: boolean;
  vat: number;
  total: number;
  retention_applied?: boolean;
}) {
  const alerts: string[] = [];
  const suggestions: string[] = [];
  if (invoice.reverse_vat && invoice.vat > 0) {
    alerts.push("Reverse VAT selected but VAT was still charged. Please check.");
  }
  if (invoice.total > 10000 && !invoice.retention_applied) {
    suggestions.push("Consider applying a retention clause for high-value job.");
  }
  return { alerts, suggestions };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Read body early (may be empty for GET)
    let body: any = null;
    if (req.method !== "GET") {
      try { body = await req.json(); } catch { body = {}; }
    }

    // We multiplex endpoints using a query param or body field: endpoint=invoices|retentions
    const endpoint = url.searchParams.get("endpoint") || body?.endpoint || "";

    if (req.method === "POST" && endpoint === "invoices") {
      const {
        companyId,
        client,
        number,
        dueDate,
        items = [],
        reverseVAT = false,
        retentionApplied = false,
      } = body || {};

      if (!companyId || !Array.isArray(items) || items.length === 0) {
        return new Response(JSON.stringify({ error: "companyId and items are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const itemTotals = items.map((it: any) => {
        if (typeof it.amount === "number") return it.amount;
        const qty = Number(it.quantity) || 0;
        const up = Number(it.unitPrice) || 0;
        return qty * up;
      });
      const netTotal = round2(itemTotals.reduce((a: number, b: number) => a + b, 0));
      const vatAmount = reverseVAT ? 0 : round2(netTotal * 0.2);
      const grandTotal = round2(netTotal + vatAmount);

      const notes = reverseVAT ? "VAT Reverse Charged — recipient responsible." : "";

      const { data: insertData, error: insertError } = await supabase
        .from("invoices")
        .insert([
          {
            company_id: companyId,
            total: grandTotal,
            due_date: dueDate ? new Date(dueDate).toISOString().slice(0, 10) : null,
            number: number || null,
            client: client || null,
            status: "issued",
            meta: {
              items,
              net_total: netTotal,
              vat_amount: vatAmount,
              reverse_vat: !!reverseVAT,
              notes,
            },
          },
        ])
        .select("id")
        .maybeSingle();

      if (insertError) {
        console.error("insert invoice error", insertError);
        return new Response(JSON.stringify({ error: "Bad request" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const risk = analyzeInvoiceForRisks({
        reverse_vat: !!reverseVAT,
        vat: vatAmount,
        total: grandTotal,
        retention_applied: !!retentionApplied,
      });

      return new Response(
        JSON.stringify({
          invoiceId: insertData?.id,
          invoiceTotal: grandTotal,
          vatAmount,
          notes,
          ...risk,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && endpoint === "retentions") {
      const { invoiceId, retentionPercent, totalGross, releaseDate } = body || {};

      if (!invoiceId || typeof totalGross !== "number" || typeof retentionPercent !== "number") {
        return new Response(
          JSON.stringify({ error: "invoiceId, totalGross, retentionPercent are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const retained = round2(totalGross * (retentionPercent / 100));
      const payable = round2(totalGross - retained);

      const { error: retErr } = await supabase.from("retentions").insert([
        {
          invoice_id: invoiceId,
          percent: retentionPercent,
          amount: retained,
          release_date: releaseDate ? new Date(releaseDate).toISOString().slice(0, 10) : null,
          status: "held",
        },
      ]);

      if (retErr) {
        console.error("insert retention error", retErr);
        return new Response(JSON.stringify({ error: "Bad request" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ retainedAmount: retained, payableAmount: payable, retentionDue: releaseDate || null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unsupported endpoint. Use endpoint=invoices|retentions" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("accounting function error", e?.message || e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
