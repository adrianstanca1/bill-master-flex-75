import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    console.log('banking-truelayer invoked', body);
    const action = body?.action || 'info';
    const details = body?.details || {};

    if (action === 'consent') {
      const consentId = `CONSENT-${Date.now()}`;
      const clientId = details.truelayerClientId || 'mock-client';
      const redirectUri = details.truelayerRedirectUri || 'https://example.com/callback';
      const url = `https://mock.truelayer.com/consent?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${consentId}`;
      return new Response(JSON.stringify({ status: 'ok', message: 'Mock consent created', consentId, url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ status: 'ok', message: 'Banking TrueLayer mock ready' }), {
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
