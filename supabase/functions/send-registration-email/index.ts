import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  email: string;
  firstName: string;
  lastName: string;
  tournamentName: string;
  tournamentLocation: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      email,
      firstName,
      lastName,
      tournamentName,
      tournamentLocation,
      startDate,
      endDate,
      amountPaid,
    }: RequestBody = await req.json();

    if (!email || !firstName || !tournamentName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-NZ", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const formattedStart = startDate ? formatDate(startDate) : "TBC";
    const formattedEnd = endDate ? formatDate(endDate) : "TBC";
    const formattedAmount = amountPaid != null ? `$${amountPaid.toFixed(2)}` : "N/A";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #16a34a; color: white; padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Registration Confirmed!</h1>
          </div>
          <div style="padding: 32px 24px;">
            <p style="margin: 0 0 16px; font-size: 18px;">Hi ${firstName},</p>
            <p style="margin: 0 0 24px;">
              Great news! Your registration for <strong>${tournamentName}</strong> has been confirmed. We're looking forward to seeing you on the court!
            </p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
              <h2 style="margin: 0 0 12px; font-size: 16px; color: #16a34a;">League Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-size: 14px;">League:</td>
                  <td style="padding: 6px 0; font-weight: bold; font-size: 14px;">${tournamentName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Location:</td>
                  <td style="padding: 6px 0; font-size: 14px;">${tournamentLocation || "TBC"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Starts:</td>
                  <td style="padding: 6px 0; font-size: 14px;">${formattedStart}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Ends:</td>
                  <td style="padding: 6px 0; font-size: 14px;">${formattedEnd}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Amount Paid:</td>
                  <td style="padding: 6px 0; font-weight: bold; font-size: 14px; color: #16a34a;">${formattedAmount}</td>
                </tr>
              </table>
            </div>
            <p style="margin: 0 0 16px;">
              You can view your registrations and league details by logging in to your Dinkly dashboard at any time.
            </p>
            <p style="margin: 16px 0 0; font-size: 14px; color: #64748b;">
              If you have any questions about the league, feel free to get in touch. See you on the court!
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0;">This email was sent from the Dinkly Pickleball League</p>
            <p style="margin: 8px 0 0;">You received this email because you registered for a league</p>
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
        to: [email],
        subject: `Registration Confirmed - ${tournamentName}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(`Failed to send email: ${resendData.message || "Unknown error"}`);
    }

    console.log("Registration email sent successfully:", resendData);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Registration confirmation email sent to ${email}`,
        emailId: resendData.id,
      }),
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
