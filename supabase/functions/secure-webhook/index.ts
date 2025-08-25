import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, webhookId, secretValue, payload } = await req.json();

    switch (action) {
      case 'create_secret': {
        // Generate cryptographically secure secret
        const secret = crypto.randomUUID() + '-' + Date.now();

        // Store encrypted secret
        const { data, error } = await supabase
          .from('webhook_secrets')
          .insert({
            webhook_id: webhookId,
            encrypted_secret: btoa(secret) // Basic encoding - use proper encryption in production
          });

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          secretId: data[0]?.id,
          secret: secret // Only return once for initial setup
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      case 'validate_webhook': {
        const signature = req.headers.get('x-webhook-signature');
        if (!signature) {
          throw new Error('Missing webhook signature');
        }

        // Rate limiting check
        const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
        const { data: rateLimitData } = await supabase
          .from('webhook_rate_limits')
          .select('request_count, window_start')
          .eq('webhook_id', webhookId)
          .eq('ip_address', clientIP)
          .gte('window_start', new Date(Date.now() - 3600000).toISOString()) // Last hour
          .single();

        if (rateLimitData && rateLimitData.request_count > 100) {
          throw new Error('Rate limit exceeded');
        }

        // Update rate limiting
        await supabase.from('webhook_rate_limits').upsert({
          webhook_id: webhookId,
          ip_address: clientIP,
          request_count: (rateLimitData?.request_count || 0) + 1,
          window_start: rateLimitData?.window_start || new Date().toISOString()
        });

        // Enhanced HMAC signature validation using database function
        const { data: isValid, error: validationError } = await supabase.rpc(
          'validate_webhook_signature',
          {
            webhook_id: webhookId,
            payload: JSON.stringify(payload),
            signature: signature
          }
        );

        if (validationError || !isValid) {
          throw new Error('Invalid webhook signature');
        }

        // Log security event
        await supabase.from('security_audit_log').insert({
          action: 'WEBHOOK_VALIDATED',
          resource_type: 'webhook',
          resource_id: webhookId,
          details: {
            signature_valid: true,
            timestamp: new Date().toISOString()
          }
        });

        return new Response(JSON.stringify({
          success: true,
          validated: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Secure webhook error:', error);
    
    // Log security violation
    await supabase.from('security_audit_log').insert({
      action: 'WEBHOOK_SECURITY_VIOLATION',
      resource_type: 'webhook',
      details: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
