import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    console.log('hmrc-vat invoked', body);
    const action = body?.action || 'info';

    if (action === 'submit_vat') {
      const receiptId = `VAT-${Date.now()}`;
      const periodKey = body?.periodKey || '24A1';
      const values = body?.values || { vatDueSales: 0, vatDueAcquisitions: 0 };
      return new Response(JSON.stringify({ status: 'ok', message: 'Mock VAT submitted', receiptId, periodKey, values }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ status: 'ok', message: 'HMRC VAT mock ready' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
