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
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { session_id, registration_id } = await req.json();

    if (!session_id || !registration_id) {
      return new Response(
        JSON.stringify({ error: "session_id and registration_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the registration belongs to this user
    const { data: registration, error: regError } = await supabaseClient
      .from("tournament_registrations")
      .select("id, payment_status, tournament_id")
      .eq("id", registration_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (regError || !registration) {
      return new Response(
        JSON.stringify({ error: "Registration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Already completed — nothing to do
    if (registration.payment_status === "completed") {
      return new Response(
        JSON.stringify({ status: "completed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-11-20.acacia",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ status: session.payment_status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Payment confirmed — update with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: updateError } = await supabaseAdmin
      .from("tournament_registrations")
      .update({
        payment_status: "completed",
        stripe_payment_intent_id: session.payment_intent as string,
        registered_at: new Date().toISOString(),
      })
      .eq("id", registration_id);

    if (updateError) {
      console.error("Error updating registration:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update registration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment participant count
    const { data: tournament } = await supabaseAdmin
      .from("tournaments")
      .select("current_participants")
      .eq("id", registration.tournament_id)
      .single();

    if (tournament) {
      await supabaseAdmin
        .from("tournaments")
        .update({ current_participants: (tournament.current_participants || 0) + 1 })
        .eq("id", registration.tournament_id);
    }

    // Send registration confirmation email
    try {
      const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("first_name, last_name, email")
        .eq("id", user.id)
        .single();

      const { data: tournamentDetails } = await supabaseAdmin
        .from("tournaments")
        .select("name, location, start_date, end_date, entry_fee")
        .eq("id", registration.tournament_id)
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
            email: profile.email || user.email,
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

    return new Response(
      JSON.stringify({ status: "completed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
