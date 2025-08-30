import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from '../_shared/cors.ts';

interface PaymentRequest {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    console.log(`Processing payment for user: ${user.email}`);

    // Get Stripe configuration
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    // Parse request body
    const { amount, currency = "gbp", description = "AS Agents Payment", metadata = {} }: PaymentRequest = await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Valid amount is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`Found existing customer: ${customerId}`);
    } else {
      // Create new customer
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          ...metadata
        }
      });
      customerId = newCustomer.id;
      console.log(`Created new customer: ${customerId}`);
    }

    // Create payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: description,
              metadata: metadata
            },
            unit_amount: Math.round(amount * 100), // Convert to pence/cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?payment=cancelled`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        ...metadata
      }
    });

    console.log(`Created payment session: ${session.id}`);

    // Optional: Store payment record in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    try {
      await supabaseService.from("payments").insert({
        user_id: user.id,
        stripe_session_id: session.id,
        amount: amount,
        currency: currency,
        status: "pending",
        description: description,
        metadata: metadata,
        created_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.warn("Failed to store payment record:", dbError);
      // Continue anyway - payment session is more important
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Payment creation failed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});