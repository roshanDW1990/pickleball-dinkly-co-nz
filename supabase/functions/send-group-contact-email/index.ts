import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GroupMember {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  pickleball_level: string;
  dupr_rating: string | null;
}

interface RequestBody {
  groupId: string;
  groupName: string;
  tournamentName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { groupId, groupName, tournamentName }: RequestBody = await req.json();

    if (!groupId || !groupName || !tournamentName) {
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
      },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const user = await userResponse.json();

    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=is_admin`,
      {
        headers: {
          apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    const profiles = await profileResponse.json();
    if (!profiles || profiles.length === 0 || !profiles[0].is_admin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const membersResponse = await fetch(
      `${supabaseUrl}/rest/v1/group_members?group_id=eq.${groupId}&select=user_id`,
      {
        headers: {
          apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    const members = await membersResponse.json();
    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ error: "No members found in this group" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const userIds = members.map((m: { user_id: string }) => m.user_id);

    const profilesResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=in.(${userIds.join(",")})&select=id,email,first_name,last_name,phone_number,pickleball_level,dupr_rating`,
      {
        headers: {
          apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    const groupMembers: GroupMember[] = await profilesResponse.json();

    let contactListHtml = "";
    groupMembers.forEach((member) => {
      contactListHtml += `
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
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
            ${member.pickleball_level}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
            ${member.dupr_rating || "N/A"}
          </td>
        </tr>
      `;
    });

    const emailsSent = [];
    const emailsFailed = [];

    for (const member of groupMembers) {
      const emailHtml = `
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
              <p style="margin: 0 0 16px;">Hi ${member.first_name},</p>
              <p style="margin: 0 0 16px;">
                You've been placed in <strong>${groupName}</strong> for <strong>${tournamentName}</strong>.
              </p>
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
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Level</th>
                      <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">DUPR</th>
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

      try {
        const emailResponse = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
          method: "POST",
          headers: {
            apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "email",
            email: member.email,
            data: {
              subject: `${groupName} - Contact Information for ${tournamentName}`,
              html: emailHtml,
            },
          }),
        });

        if (emailResponse.ok) {
          emailsSent.push(member.email);
        } else {
          console.error(`Failed to send email to ${member.email}`);
          emailsFailed.push(member.email);
        }
      } catch (error) {
        console.error(`Error sending email to ${member.email}:`, error);
        emailsFailed.push(member.email);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Emails sent to ${emailsSent.length} members`,
        emailsSent,
        emailsFailed,
        totalMembers: groupMembers.length,
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
