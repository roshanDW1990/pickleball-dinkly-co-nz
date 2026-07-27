import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.11.0";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-11-20.acacia",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { tournamentId } = await req.json();

    if (!tournamentId) {
      return new Response(
        JSON.stringify({ error: "Tournament ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: tournament, error: tournamentError } = await supabaseClient
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId)
      .single();

    if (tournamentError || !tournament) {
      return new Response(
        JSON.stringify({ error: "Tournament not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: existingRegistration } = await supabaseClient
      .from("tournament_registrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("tournament_id", tournamentId)
      .maybeSingle();

    if (existingRegistration) {
      return new Response(
        JSON.stringify({ error: "Already registered for this tournament" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (tournament.current_participants >= tournament.max_participants) {
      return new Response(
        JSON.stringify({ error: "Tournament is full" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const productName = `${tournament.name} - Tournament Registration`;
    const productDescription = `Registration for ${tournament.name} on ${new Date(tournament.start_date).toLocaleDateString()}`;

    let product;
    const existingProducts = await stripe.products.search({
      query: `metadata['tournament_id']:'${tournamentId}'`,
    });

    if (existingProducts.data.length > 0) {
      product = existingProducts.data[0];
    } else {
      product = await stripe.products.create({
        name: productName,
        description: productDescription,
        metadata: {
          tournament_id: tournamentId,
        },
      });
    }

    let price;
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    if (existingPrices.data.length > 0) {
      price = existingPrices.data[0];
    } else {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(tournament.entry_fee * 100),
        currency: "usd",
      });
    }

    const { data: registration, error: registrationError } = await supabaseClient
      .from("tournament_registrations")
      .insert({
        tournament_id: tournamentId,
        user_id: user.id,
        amount_paid: tournament.entry_fee,
        payment_status: "pending",
      })
      .select()
      .single();

    if (registrationError) {
      return new Response(
        JSON.stringify({ error: "Failed to create registration record" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const origin = req.headers.get("origin") || Deno.env.get("VITE_SUPABASE_URL");

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/upcoming-tournaments?registration=success&tournament=${tournamentId}&session_id={CHECKOUT_SESSION_ID}&registration_id=${registration.id}`,
      cancel_url: `${origin}/upcoming-tournaments?registration=cancelled`,
      customer_email: user.email,
      payment_intent_data: {
        receipt_email: user.email,
      },
      metadata: {
        tournament_id: tournamentId,
        user_id: user.id,
        registration_id: registration.id,
      },
    });

    const { error: updateError } = await supabaseClient
      .from("tournament_registrations")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", registration.id);

    if (updateError) {
      console.error("Failed to update registration with session ID:", updateError);
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
