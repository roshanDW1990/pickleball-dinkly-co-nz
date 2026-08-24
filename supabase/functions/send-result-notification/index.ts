import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  submitterName: string;
  player1Name: string;
  player2Name: string;
  winnerName: string;
  scores: string;
  leagueName: string;
  groupName?: string;
  roundNumber: number;
  matchNumber: number;
  isResubmission: boolean;
}

const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "dinklynz@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const {
      submitterName,
      player1Name,
      player2Name,
      winnerName,
      scores,
      leagueName,
      groupName,
      roundNumber,
      matchNumber,
      isResubmission,
    } = body;

    if (!submitterName || !player1Name || !player2Name || !winnerName || !leagueName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const submittedAt = new Date().toLocaleString("en-NZ", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const title = isResubmission ? "Match Result Re-submitted" : "New Match Result Submitted";
    const color = isResubmission ? "#d97706" : "#16a34a";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden;">
          <div style="background-color: ${color}; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">${title}</h1>
          </div>
          <div style="padding: 24px;">
            <p style="margin: 0 0 16px; font-size: 16px;"><strong>${submitterName}</strong> has submitted a match result for review.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">League</td><td style="padding: 8px 0; font-weight: 600;">${leagueName}</td></tr>
              ${groupName ? `<tr><td style="padding: 8px 0; color: #64748b;">Group</td><td style="padding: 8px 0;">${groupName}</td></tr>` : ""}
              <tr><td style="padding: 8px 0; color: #64748b;">Match</td><td style="padding: 8px 0;">Round ${roundNumber}, Match ${matchNumber}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Players</td><td style="padding: 8px 0;">${player1Name} vs ${player2Name}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Scores</td><td style="padding: 8px 0; font-weight: 600;">${scores}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Winner</td><td style="padding: 8px 0; font-weight: 600; color: #16a34a;">${winnerName}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Submitted</td><td style="padding: 8px 0;">${submittedAt}</td></tr>
            </table>
            <p style="margin: 24px 0 0; font-size: 14px; color: #64748b;">Please review this result in the Admin Dashboard.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "noreply@dinkly.co.nz",
        to: [ADMIN_EMAIL],
        subject: `${isResubmission ? "Re-submitted" : "New"} match result: ${player1Name} vs ${player2Name}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();
    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(`Failed to send email: ${resendData.message || "Unknown error"}`);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error sending result notification:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
