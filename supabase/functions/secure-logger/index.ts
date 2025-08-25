import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    // Get user from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { eventType, severity, details, resourceType, resourceId } = await req.json();

    // Enhanced security event logging with server-side validation
    const { data, error } = await supabaseClient
      .from('security_audit_log')
      .insert({
        user_id: user.id,
        action: eventType,
        resource_type: resourceType || 'general',
        resource_id: resourceId,
        details: {
          ...details,
          server_timestamp: new Date().toISOString(),
          user_agent: req.headers.get('user-agent'),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          client_timestamp: details?.timestamp,
          severity: severity || 'info'
        }
      });

    if (error) {
      console.error('Failed to log security event:', error);
      throw error;
    }

    // Check if this is a critical security event that needs immediate alerting
    if (severity === 'critical' || severity === 'high') {
      await supabaseClient
        .from('security_events')
        .insert({
          event_type: eventType,
          severity: severity,
          user_id: user.id,
          details: {
            ...details,
            alert_generated: true,
            alert_timestamp: new Date().toISOString()
          }
        });
    }

    console.log(`Security event logged: ${eventType} (${severity}) for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventId: data?.[0]?.id,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Secure logger error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});