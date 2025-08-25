import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    console.log('hmrc-oauth invoked', body);
    const action = body?.action || 'info';
    const details = body?.details || {};

    if (action === 'start') {
      const state = (globalThis as any).crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
      const clientId = details.hmrcClientId || 'mock-client';
      const redirectUri = details.hmrcRedirectUri || 'https://example.com/callback';
      const url = `https://mock.hmrc.service/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
      return new Response(JSON.stringify({ status: 'ok', message: 'Mock OAuth URL generated', url, state, clientId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'exchange') {
      return new Response(JSON.stringify({ status: 'ok', access_token: 'mock_access_token', refresh_token: 'mock_refresh_token', expires_in: 3600 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ status: 'ok', message: 'HMRC OAuth mock ready' }), {
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
