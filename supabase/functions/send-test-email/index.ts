import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getMidpointDate(startStr: string, endStr: string): string {
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  return new Date(start.getTime() + (end.getTime() - start.getTime()) / 2).toISOString().split("T")[0];
}

// Mirrors the layout in send-group-contact-email, filled with sample players.
function buildGroupContactPreview(): { subject: string; html: string } {
  const groupName = "Group A";
  const tournamentName = "Tawa/Porirua Pickleball League - Season 1";
  const startDate = "2026-10-26";
  const endDate = "2026-12-21";
  const members = [
    { first_name: "Sample", last_name: "Player One", email: "player.one@example.com", phone_number: "021 123 4567" },
    { first_name: "Sample", last_name: "Player Two", email: "player.two@example.com", phone_number: "022 234 5678" },
    { first_name: "Sample", last_name: "Player Three", email: "player.three@example.com", phone_number: null },
    { first_name: "Sample", last_name: "Player Four", email: "player.four@example.com", phone_number: "027 456 7890" },
  ];

  const contactListHtml = members.map((member) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
            <strong>${member.first_name} ${member.last_name}</strong>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
            <a href="mailto:${member.email}" style="color: #16a34a;">${member.email}</a>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
            ${member.phone_number || "Not provided"}
          </td>
        </tr>
      `).join("");

  const datesHtml = `
        <div style="margin: 20px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #166534;">League Dates</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #334155; width: 120px;">Start Date:</td>
              <td style="padding: 6px 0; color: #334155;">${formatDate(startDate)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #334155;">Midpoint:</td>
              <td style="padding: 6px 0; color: #334155;">${formatDate(getMidpointDate(startDate, endDate))}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #334155;">End Date:</td>
              <td style="padding: 6px 0; color: #334155;">${formatDate(endDate)}</td>
            </tr>
          </table>
        </div>
      `;

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #16a34a; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Group Contact Information</h1>
            </div>
            <div style="padding: 24px;">
              <p style="margin: 0 0 16px;">Hi ${members[0].first_name},</p>
              <p style="margin: 0 0 16px;">
                You've been placed in <strong>${groupName}</strong> for <strong>${tournamentName}</strong>.
              </p>
              ${datesHtml}
              <p style="margin: 0 0 16px;">
                Below is the contact information for all players in your group. Please reach out to schedule your matches!
              </p>

              <div style="margin: 24px 0;">
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
                  <thead>
                    <tr style="background-color: #f1f5f9;">
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Name</th>
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Email</th>
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${contactListHtml}
                  </tbody>
                </table>
              </div>

              <p style="margin: 16px 0 0; font-size: 14px; color: #64748b;">
                Good luck with your matches!
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0;">This email was sent from the Pickleball League Management System</p>
            </div>
          </div>
        </body>
        </html>
      `;

  return { subject: `[TEST] ${groupName} - Contact Information for ${tournamentName}`, html };
}

function buildDefaultTest(): { subject: string; html: string } {
  return {
    subject: "Test Email from Pickleball Platform",
    html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏓 Test Email</h1>
              </div>
              <div class="content">
                <h2>Hello!</h2>
                <p>This is a test email from your Dinkly platform.</p>
                <p>If you're receiving this, it means the email service is working correctly!</p>
                <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
                <p>Best regards,<br>The Pickleball Platform Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

    let recipient = "dinklynz@gmail.com";
    let template = "";
    try {
      const body = await req.json();
      if (body?.to) recipient = body.to;
      if (body?.template) template = body.template;
    } catch {
      // no body or invalid JSON — use defaults
    }

    const { subject, html } = template === "group-contact" ? buildGroupContactPreview() : buildDefaultTest();

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: "hello@dinkly.co.nz", to: [recipient], subject, html }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test email sent successfully!",
        emailId: resendData.id
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending test email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
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
