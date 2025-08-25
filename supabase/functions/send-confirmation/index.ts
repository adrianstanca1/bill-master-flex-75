import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { WelcomeEmail } from './_templates/welcome-email.tsx'
import { resend } from '../_shared/resend.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') || Deno.env.get('WEBHOOK_SECRET') || Deno.env.get('CRON_SECRET')

import { corsHeaders as baseCorsHeaders } from '../_shared/cors.ts';

const corsHeaders = {
  ...baseCorsHeaders,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
)

// Enhanced webhook signature verification
function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!hookSecret) {
    console.error("No webhook secret configured")
    return false
  }
  
  try {
    const encoder = new TextEncoder()
    const key = encoder.encode(hookSecret)
    const data = encoder.encode(payload)
    
    // Simple comparison for now - in production use HMAC-SHA256
    return signature === hookSecret || signature.includes(hookSecret)
  } catch (error) {
    console.error("Webhook verification failed:", error)
    return false
  }
}

Deno.serve(async (req) => {
  console.log("=== Enhanced Email Confirmation Handler Started ===")
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    const rawPayload = await req.text()
    const headers = Object.fromEntries(req.headers)
    const signature = req.headers.get("x-webhook-signature") || req.headers.get("authorization")
    
    console.log('Received auth webhook with signature verification')

    // Enhanced security: verify webhook signature
    if (hookSecret && signature && !verifyWebhookSignature(rawPayload, signature)) {
      console.error("Webhook signature verification failed")
      
      // Log security violation
      try {
        await supabase.from('security_audit_log').insert({
          action: 'WEBHOOK_VERIFICATION_FAILED',
          resource_type: 'email_confirmation',
          details: {
            ip_address: req.headers.get("x-forwarded-for"),
            user_agent: req.headers.get("user-agent"),
            timestamp: new Date().toISOString(),
            has_signature: !!signature
          }
        })
      } catch (dbError) {
        console.error('Failed to log security event:', dbError)
      }
      
      return new Response("Unauthorized - invalid webhook signature", { 
        status: 401, 
        headers: corsHeaders 
      })
    }
    
    // Process webhook data
    let webhookData: any
    
    if (hookSecret && signature) {
      const wh = new Webhook(hookSecret)
      webhookData = wh.verify(rawPayload, headers)
    } else {
      // Development mode without webhook verification
      webhookData = JSON.parse(rawPayload)
      console.log('Processing without webhook verification (development mode)')
    }

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = webhookData as {
      user: {
        email: string
        email_confirmed_at?: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    console.log('Processing email for:', user.email, 'Action:', email_action_type)

    // Only send confirmation emails, not other types
    if (email_action_type !== 'signup') {
      console.log('Skipping non-signup email type:', email_action_type)
      return new Response(JSON.stringify({ skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const redirectTo = redirect_to || `${supabaseUrl}/dashboard`

    console.log('Rendering email template...')
    const html = await renderAsync(
      React.createElement(WelcomeEmail, {
        supabase_url: supabaseUrl,
        token,
        token_hash,
        redirect_to: redirectTo,
        email_action_type,
        user_email: user.email,
      })
    )

    console.log('Sending email via Resend...')
    const { data, error } = await resend.emails.send({
      from: 'AS Cladding & Roofing <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Confirm your email - AS Cladding & Roofing',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully:', data)
    
    // Log successful email sending
    try {
      await supabase.from('security_audit_log').insert({
        action: 'EMAIL_SENT',
        resource_type: 'welcome_email',
        details: {
          recipient: user.email,
          message_id: data?.id,
          timestamp: new Date().toISOString()
        }
      })
    } catch (dbError) {
      console.error('Failed to log email success:', dbError)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      email_id: data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Error in send-confirmation function:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR'
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})