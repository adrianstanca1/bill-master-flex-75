import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { resend } from "../_shared/resend.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, userId }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to: ${email} for user: ${userId}`);

    const displayName = firstName && lastName ? `${firstName} ${lastName}` : 
                       firstName ? firstName : 
                       email.split('@')[0];

    const emailResponse = await resend.emails.send({
      from: "SmartOps <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to SmartOps - Your Construction Management Platform!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f8fafc; }
            .cta-button { background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 Welcome to SmartOps!</h1>
            <p>Your intelligent construction management platform</p>
          </div>
          
          <div class="content">
            <h2>Hi ${displayName}! 👋</h2>
            
            <p>Thank you for joining SmartOps! We're excited to help you revolutionize your construction business management with our AI-powered platform.</p>
            
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || 'https://your-app.com'}/setup" class="cta-button">
              Complete Your Setup →
            </a>
            
            <div class="features">
              <h3>🔧 What you can do with SmartOps:</h3>
              
              <div class="feature-item">
                <strong>📊 Project Management</strong><br>
                Track projects, milestones, and team assignments in real-time
              </div>
              
              <div class="feature-item">
                <strong>💰 Financial Management</strong><br>
                Generate quotes, invoices, and track expenses effortlessly
              </div>
              
              <div class="feature-item">
                <strong>🤖 AI-Powered Assistance</strong><br>
                Get intelligent insights and automated business analytics
              </div>
              
              <div class="feature-item">
                <strong>📈 Business Analytics</strong><br>
                Monitor performance metrics and growth indicators
              </div>
              
              <div class="feature-item">
                <strong>🔒 Security & Compliance</strong><br>
                Enterprise-grade security with audit trails and monitoring
              </div>
            </div>
            
            <h3>🚀 Getting Started:</h3>
            <ol>
              <li>Complete your company setup</li>
              <li>Explore the dashboard and key features</li>
              <li>Create your first project or quote</li>
              <li>Invite team members to collaborate</li>
            </ol>
            
            <p>Need help? Our support team is here to assist you every step of the way!</p>
          </div>
          
          <div class="footer">
            <p>SmartOps - Intelligent Construction Management</p>
            <p>This email was sent because you created an account on our platform.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    // Log the email activity to our audit system
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
      await supabase
        .from('security_audit_log')
        .insert({
          user_id: userId,
          action: 'WELCOME_EMAIL_SENT',
          resource_type: 'email',
          details: {
            email_id: emailResponse.data?.id,
            recipient: email,
            timestamp: new Date().toISOString()
          }
        });
    } catch (auditError) {
      console.warn('Failed to log email activity:', auditError);
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);