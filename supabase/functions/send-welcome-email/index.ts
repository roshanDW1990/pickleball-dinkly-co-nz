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
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, firstName, lastName }: RequestBody = await req.json();

    if (!email || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

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
            <h1 style="margin: 0; font-size: 28px;">Welcome to Dinkly!</h1>
          </div>
          <div style="padding: 32px 24px;">
            <p style="margin: 0 0 16px; font-size: 18px;">Hi ${firstName},</p>
            <p style="margin: 0 0 16px;">
              Thank you for joining our pickleball community! We're excited to have you as part of our league.
            </p>
            <p style="margin: 0 0 16px;">
              Your account has been successfully created and you can now:
            </p>
            <ul style="margin: 0 0 24px; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Browse and register for upcoming tournaments</li>
              <li style="margin-bottom: 8px;">Track your matches and tournament progress</li>
              <li style="margin-bottom: 8px;">View league standings and your ranking</li>
              <li style="margin-bottom: 8px;">Connect with other players in your groups</li>
              <li style="margin-bottom: 8px;">Submit match results and scores</li>
            </ul>
            <p style="margin: 0 0 24px;">
              Get started by logging in to your dashboard and checking out the upcoming tournaments!
            </p>
            <p style="margin: 16px 0 0; font-size: 14px; color: #64748b;">
              If you have any questions, feel free to reach out to us. See you on the court!
            </p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0;">This email was sent from the Pickleball League Management System</p>
            <p style="margin: 8px 0 0;">You received this email because you created an account with us</p>
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
        subject: "Welcome to Dinkly!",
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      throw new Error(`Failed to send email: ${resendData.message || "Unknown error"}`);
    }

    console.log("Welcome email sent successfully:", resendData);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Welcome email sent to ${email}`,
        emailId: resendData.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
