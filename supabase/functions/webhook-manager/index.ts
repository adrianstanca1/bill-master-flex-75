import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/webhook-manager', '');

    // Test webhook endpoint
    if (req.method === 'POST' && path === '/test') {
      const { webhookId } = await req.json();
      
      // Get webhook details
      const { data: webhook, error: webhookError } = await supabaseClient
        .from('webhooks')
        .select('*')
        .eq('id', webhookId)
        .single();

      if (webhookError || !webhook) {
        return new Response(
          JSON.stringify({ error: 'Webhook not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Test the webhook endpoint
      try {
        const testPayload = {
          event_type: 'test',
          timestamp: new Date().toISOString(),
          data: { message: 'Test webhook from AS PRO' }
        };

        const webhookResponse = await fetch(webhook.endpoint_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': webhook.secret_key,
          },
          body: JSON.stringify(testPayload),
        });

        const success = webhookResponse.ok;
        
        // Update webhook status
        await supabaseClient
          .from('webhooks')
          .update({
            last_triggered: new Date().toISOString(),
            retry_count: success ? 0 : webhook.retry_count + 1,
          })
          .eq('id', webhookId);

        return new Response(
          JSON.stringify({
            success,
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to test webhook', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Trigger webhook for event
    if (req.method === 'POST' && path === '/trigger') {
      const { event_type, data, company_id } = await req.json();

      // Get all active webhooks for this company and event type
      const { data: webhooks, error: webhooksError } = await supabaseClient
        .from('webhooks')
        .select('*')
        .eq('company_id', company_id)
        .eq('event_type', event_type)
        .eq('is_active', true);

      if (webhooksError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch webhooks' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const results = [];
      
      for (const webhook of webhooks || []) {
        try {
          const payload = {
            event_type,
            timestamp: new Date().toISOString(),
            data,
            webhook_id: webhook.id,
          };

          const response = await fetch(webhook.endpoint_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': webhook.secret_key,
            },
            body: JSON.stringify(payload),
          });

          const success = response.ok;
          
          // Update webhook status
          await supabaseClient
            .from('webhooks')
            .update({
              last_triggered: new Date().toISOString(),
              retry_count: success ? 0 : webhook.retry_count + 1,
            })
            .eq('id', webhook.id);

          results.push({
            webhook_id: webhook.id,
            success,
            status: response.status,
          });
        } catch (error) {
          results.push({
            webhook_id: webhook.id,
            success: false,
            error: error.message,
          });
        }
      }

      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook manager error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});