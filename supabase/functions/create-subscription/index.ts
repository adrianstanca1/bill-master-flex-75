import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from '../_shared/cors.ts';

interface SubscriptionRequest {
  priceId?: string;
  planName?: string;
  amount?: number;
  interval?: 'month' | 'year';
  currency?: string;
  metadata?: Record<string, any>;
}

const SUBSCRIPTION_PLANS = {
  basic: {
    name: "AS Agents Basic",
    amount: 2999, // £29.99
    interval: 'month' as const,
    features: ["Basic dashboard", "5 projects", "Invoice management", "Email support"]
  },
  premium: {
    name: "AS Agents Premium", 
    amount: 7999, // £79.99
    interval: 'month' as const,
    features: ["Full dashboard", "Unlimited projects", "Advanced analytics", "AI agents", "Priority support"]
  },
  enterprise: {
    name: "AS Agents Enterprise",
    amount: 19999, // £199.99
    interval: 'month' as const,
    features: ["Enterprise features", "Custom integrations", "Dedicated support", "On-premise options"]
  }
};

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

    console.log(`Processing subscription for user: ${user.email}`);

    // Get Stripe configuration
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not configured");

    // Parse request body
    const { 
      priceId, 
      planName = "premium", 
      amount, 
      interval = "month", 
      currency = "gbp", 
      metadata = {} 
    }: SubscriptionRequest = await req.json();

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

    // Get or create price
    let finalPriceId = priceId;
    
    if (!finalPriceId) {
      const plan = SUBSCRIPTION_PLANS[planName as keyof typeof SUBSCRIPTION_PLANS] || SUBSCRIPTION_PLANS.premium;
      const finalAmount = amount || plan.amount;
      
      // Create or find existing price
      const prices = await stripe.prices.list({
        product: await getOrCreateProduct(stripe, plan.name),
        unit_amount: finalAmount,
        currency: currency,
        recurring: { interval: interval },
        active: true,
        limit: 1
      });

      if (prices.data.length > 0) {
        finalPriceId = prices.data[0].id;
      } else {
        const newPrice = await stripe.prices.create({
          product: await getOrCreateProduct(stripe, plan.name),
          unit_amount: finalAmount,
          currency: currency,
          recurring: { interval: interval },
          metadata: { plan: planName }
        });
        finalPriceId = newPrice.id;
      }
    }

    // Create subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?subscription=cancelled`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan: planName,
        ...metadata
      }
    });

    console.log(`Created subscription session: ${session.id}`);

    // Store subscription record in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    try {
      await supabaseService.from("subscriptions").upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        stripe_session_id: session.id,
        plan: planName,
        status: "pending",
        metadata: metadata,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    } catch (dbError) {
      console.warn("Failed to store subscription record:", dbError);
      // Continue anyway - checkout session is more important
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      customer_id: customerId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Subscription creation error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Subscription creation failed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function getOrCreateProduct(stripe: Stripe, productName: string): Promise<string> {
  // Search for existing product
  const products = await stripe.products.list({
    active: true,
    limit: 10
  });

  const existingProduct = products.data.find(p => p.name === productName);
  if (existingProduct) {
    return existingProduct.id;
  }

  // Create new product
  const newProduct = await stripe.products.create({
    name: productName,
    type: 'service',
    metadata: { source: 'as-agents' }
  });

  return newProduct.id;
}