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
    const { result_id, rejection_reason } = await req.json();

    if (!result_id || !rejection_reason?.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing result_id or rejection_reason" }),
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

    // Fetch result with match and player details
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
        match:match_id (
          player1_id,
          player2_id,
          round_number,
          match_number,
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

    const scoreRows = (p1Score: number | null, p2Score: number | null, label: string) => {
      if (p1Score === null && p2Score === null) return '';
      return `
        <tr>
          <td style="padding: 8px 16px; text-align: center; font-size: 14px; color: #64748b;">${label}</td>
          <td style="padding: 8px 16px; text-align: center; font-size: 20px; font-weight: 700; color: #1e293b;">${p1Score ?? '-'}</td>
          <td style="padding: 8px 16px; text-align: center; font-size: 20px; font-weight: 700; color: #1e293b;">${p2Score ?? '-'}</td>
        </tr>
      `;
    };

    const buildEmailHtml = (recipientFirstName: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <div style="background-color: #dc2626; padding: 32px 24px; text-align: center;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin-bottom: 16px;">
              <span style="font-size: 24px;">&#10006;</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; color: white; font-weight: 700;">Match Result Rejected</h1>
            <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.85);">Action required — please resubmit your match result</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <p style="margin: 0 0 20px; font-size: 16px; color: #334155;">Hi ${recipientFirstName},</p>
            <p style="margin: 0 0 24px; color: #475569;">
              Your match result has been reviewed by a league administrator and was <strong style="color: #dc2626;">rejected</strong>.
              Please review the reason below and resubmit the correct result.
            </p>

            <!-- Rejection Reason Box -->
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #991b1b;">Reason for Rejection</p>
              <p style="margin: 0; font-size: 15px; color: #7f1d1d; line-height: 1.6;">${rejection_reason}</p>
            </div>

            <!-- Match Scores -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f1f5f9;">
                    <th style="padding: 10px 16px; text-align: center; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;"></th>
                    <th style="padding: 10px 16px; text-align: center; font-size: 13px; color: #334155; font-weight: 600;">${player1.first_name} ${player1.last_name}</th>
                    <th style="padding: 10px 16px; text-align: center; font-size: 13px; color: #334155; font-weight: 600;">${player2.first_name} ${player2.last_name}</th>
                  </tr>
                </thead>
                <tbody>
                  ${scoreRows(result.player1_set1_score, result.player2_set1_score, '1st Set')}
                  ${scoreRows(result.player1_set2_score, result.player2_set2_score, '2nd Set')}
                  ${scoreRows(result.player1_set3_score, result.player2_set3_score, '3rd Set')}
                </tbody>
              </table>
            </div>

            <p style="margin: 0 0 8px; color: #475569;">
              Please log in to your account to resubmit the correct match result. If you believe this decision is incorrect, please contact a league administrator.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">Pickleball League Management System</p>
            <p style="margin: 6px 0 0; font-size: 12px; color: #94a3b8;">You received this because you are a participant in this match</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const recipients = [
      { email: player1.email, firstName: player1.first_name },
      { email: player2.email, firstName: player2.first_name },
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
          from: "onboarding@resend.dev",
          to: [recipient.email],
          subject: "Match Result Rejected — Please Resubmit",
          html: buildEmailHtml(recipient.firstName),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error(`Failed to send email to ${recipient.email}:`, data);
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
