import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { result_id } = await req.json();

    if (!result_id) {
      return new Response(
        JSON.stringify({ error: "Missing result_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: result, error: resultError } = await adminClient
      .from("match_results")
      .select(`
        id,
        player1_set1_score,
        player1_set2_score,
        player1_set3_score,
        player2_set1_score,
        player2_set2_score,
        player2_set3_score,
        winner_id,
        match:match_id (
          player1_id,
          player2_id,
          round_number,
          match_number,
          tournament:tournament_id (name),
          player1:player1_id (first_name, last_name, email),
          player2:player2_id (first_name, last_name, email)
        )
      `)
      .eq("id", result_id)
      .maybeSingle();

    if (resultError || !result) {
      console.error("Error fetching result:", resultError);
      return new Response(
        JSON.stringify({ error: "Result not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const match = result.match as any;
    const player1 = match.player1;
    const player2 = match.player2;
    const tournamentName = match.tournament?.name ?? "the league";
    const winnerId = result.winner_id;

    const scoreRow = (p1Score: number | null, p2Score: number | null, label: string) => {
      if (p1Score === null && p2Score === null) return "";
      return `
        <tr>
          <td style="padding:8px 16px;text-align:center;font-size:14px;color:#64748b;">${label}</td>
          <td style="padding:8px 16px;text-align:center;font-size:20px;font-weight:700;color:#1e293b;">${p1Score ?? "-"}</td>
          <td style="padding:8px 16px;text-align:center;font-size:20px;font-weight:700;color:#1e293b;">${p2Score ?? "-"}</td>
        </tr>
      `;
    };

    const buildEmailHtml = (
      recipientFirstName: string,
      isWinner: boolean,
      opponentName: string
    ) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family:Arial,sans-serif;line-height:1.6;color:#334155;background-color:#f8fafc;margin:0;padding:0;">
        <div style="max-width:600px;margin:20px auto;background-color:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background-color:#16a34a;padding:32px 24px;text-align:center;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background-color:rgba(255,255,255,0.2);border-radius:50%;margin-bottom:16px;">
              <span style="font-size:26px;">&#10003;</span>
            </div>
            <h1 style="margin:0;font-size:24px;color:white;font-weight:700;">Match Result Confirmed</h1>
            <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">${tournamentName}</p>
          </div>

          <!-- Body -->
          <div style="padding:32px 24px;">
            <p style="margin:0 0 20px;font-size:16px;color:#334155;">Dear ${recipientFirstName},</p>
            <p style="margin:0 0 20px;color:#475569;">
              We are pleased to inform you that the result of your recent match against
              <strong>${opponentName}</strong> has been officially reviewed and
              <strong style="color:#16a34a;">approved</strong> by the league administrator.
            </p>
            ${isWinner
              ? `<div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #16a34a;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
                   <p style="margin:0;font-size:15px;color:#166534;font-weight:600;">Congratulations — you won this match!</p>
                   <p style="margin:6px 0 0;font-size:14px;color:#166534;">Your victory has been recorded and your standings have been updated accordingly.</p>
                 </div>`
              : `<div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
                   <p style="margin:0;font-size:15px;color:#475569;">Your participation has been recorded. Keep up the great work on the court!</p>
                 </div>`
            }

            <!-- Score Table -->
            <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="background-color:#f1f5f9;">
                    <th style="padding:10px 16px;text-align:center;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;"></th>
                    <th style="padding:10px 16px;text-align:center;font-size:13px;color:#334155;font-weight:600;">${player1.first_name} ${player1.last_name}</th>
                    <th style="padding:10px 16px;text-align:center;font-size:13px;color:#334155;font-weight:600;">${player2.first_name} ${player2.last_name}</th>
                  </tr>
                </thead>
                <tbody>
                  ${scoreRow(result.player1_set1_score, result.player2_set1_score, "1st Set")}
                  ${scoreRow(result.player1_set2_score, result.player2_set2_score, "2nd Set")}
                  ${scoreRow(result.player1_set3_score, result.player2_set3_score, "3rd Set")}
                </tbody>
              </table>
            </div>

            <p style="margin:0 0 8px;color:#475569;">
              Your league standings have been updated to reflect this result. You can log in to your account at any time to view the current standings and your upcoming matches.
            </p>
            <p style="margin:16px 0 0;color:#475569;">
              Thank you for your participation and sportsmanship. We look forward to seeing you on the court!
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">Pickleball League Management System</p>
            <p style="margin:6px 0 0;font-size:12px;color:#94a3b8;">You received this email because you are a participant in this match.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const recipients = [
      {
        email: player1.email,
        firstName: player1.first_name,
        isWinner: match.player1_id === winnerId,
        opponentName: `${player2.first_name} ${player2.last_name}`,
      },
      {
        email: player2.email,
        firstName: player2.first_name,
        isWinner: match.player2_id === winnerId,
        opponentName: `${player1.first_name} ${player1.last_name}`,
      },
    ];

    const emailResults = [];

    for (const recipient of recipients) {
      if (!recipient.email) continue;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "noreply@dinkly.co.nz",
          to: [recipient.email],
          subject: `Match Result Approved — ${tournamentName}`,
          html: buildEmailHtml(recipient.firstName, recipient.isWinner, recipient.opponentName),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error(`Failed to send approval email to ${recipient.email}:`, data);
      }
      emailResults.push({ email: recipient.email, ok: response.ok, id: data.id });
    }

    return new Response(
      JSON.stringify({ success: true, emails: emailResults }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
