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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Missing signature or webhook secret" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const tournamentId = session.metadata?.tournament_id;
      const userId = session.metadata?.user_id;
      const registrationId = session.metadata?.registration_id;

      if (!tournamentId || !userId || !registrationId) {
        console.error("Missing metadata in session");
        return new Response(
          JSON.stringify({ error: "Missing metadata" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("tournament_registrations")
        .update({
          payment_status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
          registered_at: new Date().toISOString(),
        })
        .eq("id", registrationId);

      if (updateError) {
        console.error("Error updating registration:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update registration" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data: tournament } = await supabaseAdmin
        .from("tournaments")
        .select("current_participants")
        .eq("id", tournamentId)
        .single();

      if (tournament) {
        const { error: tournamentError } = await supabaseAdmin
          .from("tournaments")
          .update({
            current_participants: (tournament.current_participants || 0) + 1,
          })
          .eq("id", tournamentId);

        if (tournamentError) {
          console.error("Error updating tournament participants:", tournamentError);
        }
      }

      // Send registration confirmation email
      try {
        const { data: profile } = await supabaseAdmin
          .from("user_profiles")
          .select("first_name, last_name, email")
          .eq("id", userId)
          .single();

        const { data: tournamentDetails } = await supabaseAdmin
          .from("tournaments")
          .select("name, location, start_date, end_date, entry_fee")
          .eq("id", tournamentId)
          .single();

        if (profile && tournamentDetails) {
          const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
          const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

          await fetch(`${supabaseUrl}/functions/v1/send-registration-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              email: profile.email || session.customer_email,
              firstName: profile.first_name,
              lastName: profile.last_name,
              tournamentName: tournamentDetails.name,
              tournamentLocation: tournamentDetails.location,
              startDate: tournamentDetails.start_date,
              endDate: tournamentDetails.end_date,
              amountPaid: tournamentDetails.entry_fee,
            }),
          });
        }
      } catch (emailErr) {
        console.error("Failed to send registration email:", emailErr);
      }

      console.log(`Successfully processed registration ${registrationId} for tournament ${tournamentId}`);
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const registrationId = session.metadata?.registration_id;

      if (registrationId) {
        const { error: updateError } = await supabaseAdmin
          .from("tournament_registrations")
          .update({
            payment_status: "failed",
          })
          .eq("id", registrationId);

        if (updateError) {
          console.error("Error updating expired registration:", updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
