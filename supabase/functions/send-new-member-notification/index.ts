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
  phoneNumber?: string | null;
  location?: string | null;
  createdAt?: string | null;
}

const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "dinklynz@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, phoneNumber, location, createdAt }: RequestBody =
      await req.json();

    if (!email || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const joinedAt = createdAt
      ? new Date(createdAt).toLocaleString("en-NZ", { dateStyle: "medium", timeStyle: "short" })
      : new Date().toLocaleString("en-NZ", { dateStyle: "medium", timeStyle: "short" });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #16a34a; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">New Member Signup</h1>
          </div>
          <div style="padding: 24px;">
            <p style="margin: 0 0 16px; font-size: 16px;">A new player just joined Dinkly.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${firstName} ${lastName}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Phone</td><td style="padding: 8px 0;">${phoneNumber || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Location</td><td style="padding: 8px 0;">${location || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Joined</td><td style="padding: 8px 0;">${joinedAt}</td></tr>
            </table>
            <p style="margin: 24px 0 0; font-size: 14px; color: #64748b;">
              View all members in the Admin Dashboard.
            </p>
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
        subject: `New Dinkly member: ${firstName} ${lastName}`,
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
