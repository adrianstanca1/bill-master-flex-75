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
    console.log('hmrc-rti invoked', body);
    const action = body?.action || 'info';

    if (action === 'fps') {
      const submissionId = `RTI-${Date.now()}`;
      const employeesCount = Array.isArray(body?.employees) ? body.employees.length : 0;
      return new Response(JSON.stringify({ status: 'ok', message: 'Mock RTI FPS submitted', submissionId, employeesCount }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ status: 'ok', message: 'HMRC RTI mock ready' }), {
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
