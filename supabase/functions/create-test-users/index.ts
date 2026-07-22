import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const testUsers = [
  { email: "test.player1@example.com", first_name: "James", last_name: "Wilson" },
  { email: "test.player2@example.com", first_name: "Sarah", last_name: "Johnson" },
  { email: "test.player3@example.com", first_name: "Michael", last_name: "Brown" },
  { email: "test.player4@example.com", first_name: "Emily", last_name: "Davis" },
  { email: "test.player5@example.com", first_name: "Daniel", last_name: "Martinez" },
  { email: "test.player6@example.com", first_name: "Olivia", last_name: "Taylor" },
  { email: "test.player7@example.com", first_name: "Chris", last_name: "Anderson" },
  { email: "test.player8@example.com", first_name: "Jessica", last_name: "Thomas" },
  { email: "test.player9@example.com", first_name: "Ryan", last_name: "Jackson" },
  { email: "test.player10@example.com", first_name: "Amanda", last_name: "White" },
];

const levels = ["Beginner", "Intermediate", "Advanced"];
const TOURNAMENT_ID = "6ddf1801-52b1-4c93-8ba0-855858a074a1";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];

    for (const user of testUsers) {
      // Create auth user via admin API
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: user.email,
        password: "TestPass123!",
        email_confirm: true,
        user_metadata: { first_name: user.first_name, last_name: user.last_name },
      });

      if (authError && !authError.message.includes("already been registered")) {
        results.push({ email: user.email, status: "error", error: authError.message });
        continue;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        // User already exists — look them up and still register them
        const { data: existing } = await adminClient.auth.admin.listUsers();
        const found = existing?.users?.find((u) => u.email === user.email);
        if (!found) {
          results.push({ email: user.email, status: "skipped" });
          continue;
        }
        await adminClient.from("tournament_registrations").upsert({
          tournament_id: TOURNAMENT_ID,
          user_id: found.id,
          payment_status: "paid",
          amount_paid: 5.00,
          registered_at: new Date().toISOString(),
        }, { onConflict: "tournament_id,user_id" });
        results.push({ email: user.email, status: "already_exists_registered", id: found.id });
        continue;
      }

      // Create profile
      const level = levels[Math.floor(Math.random() * levels.length)];
      await adminClient.from("profiles").upsert({
        id: userId,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        username: `${user.first_name.toLowerCase()}.${user.last_name.toLowerCase()}`,
        location: "New York",
        pickleball_level: level,
      });

      // Register in tournament
      await adminClient.from("tournament_registrations").upsert({
        tournament_id: TOURNAMENT_ID,
        user_id: userId,
        payment_status: "paid",
        amount_paid: 5.00,
        registered_at: new Date().toISOString(),
      }, { onConflict: "tournament_id,user_id" });

      results.push({ email: user.email, status: "created", id: userId });
    }

    // Update participant count
    const { count } = await adminClient
      .from("tournament_registrations")
      .select("*", { count: "exact", head: true })
      .eq("tournament_id", TOURNAMENT_ID);

    await adminClient
      .from("tournaments")
      .update({ current_participants: count ?? 0 })
      .eq("id", TOURNAMENT_ID);

    return new Response(JSON.stringify({ results, participant_count: count }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
