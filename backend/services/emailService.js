/**
 * Email service using Resend REST API.
 * Uses native fetch (Node 18+) so zero extra npm dependencies are required.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

/**
 * Generate beautiful HTML for the selection congratulations email
 */
function generateSelectionEmailHtml({ leaderName, teamName, danceStyle, memberCount, competitionTitle }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Congratulations! Your Dance Team has been Selected</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0B6B6B 0%, #084E4E 100%); padding: 36px 30px; text-align: center;">
              <span style="font-size: 42px;">🏆</span>
              <h1 style="color: #ffffff; margin: 12px 0 6px 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                Congratulations, Team ${teamName}!
              </h1>
              <p style="color: #F5A623; margin: 0; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                You Have Been Selected!
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <p style="font-size: 16px; color: #333333; line-height: 1.6; margin-top: 0;">
                Dear <strong>${leaderName}</strong>,
              </p>
              <p style="font-size: 15px; color: #555555; line-height: 1.6;">
                We are thrilled to inform you that after careful review of your audition video and proposal, the competition judging panel has <strong>ACCEPTED</strong> your dance team's application for <strong>${competitionTitle || "The Championship"}</strong>!
              </p>

              <!-- Application Summary Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #E6F5F5; border: 1px solid #0B6B6B33; border-radius: 12px; margin: 24px 0; padding: 18px;">
                <tr>
                  <td>
                    <table width="100%" border="0" cellspacing="6" cellpadding="0">
                      <tr>
                        <td width="35%" style="color: #084E4E; font-size: 13px; font-weight: 700;">TEAM NAME:</td>
                        <td style="color: #1A1A1A; font-size: 14px; font-weight: 600;">${teamName}</td>
                      </tr>
                      <tr>
                        <td style="color: #084E4E; font-size: 13px; font-weight: 700;">TEAM LEADER:</td>
                        <td style="color: #1A1A1A; font-size: 14px;">${leaderName}</td>
                      </tr>
                      <tr>
                        <td style="color: #084E4E; font-size: 13px; font-weight: 700;">DANCE STYLE:</td>
                        <td style="color: #1A1A1A; font-size: 14px;">${danceStyle}</td>
                      </tr>
                      <tr>
                        <td style="color: #084E4E; font-size: 13px; font-weight: 700;">DANCERS COUNT:</td>
                        <td style="color: #1A1A1A; font-size: 14px;">${memberCount} members</td>
                      </tr>
                      <tr>
                        <td style="color: #084E4E; font-size: 13px; font-weight: 700;">STATUS:</td>
                        <td><span style="background-color: #27AE60; color: #ffffff; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">ACCEPTED & CONFIRMED</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <h3 style="color: #084E4E; font-size: 17px; margin-top: 24px; margin-bottom: 12px;">Next Steps for Your Crew:</h3>
              <ul style="color: #555555; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
                <li>Prepare your 3 to 5 minute final performance music track in MP3/WAV format.</li>
                <li>Ensure all ${memberCount} dancers have their photo IDs ready for stage entry.</li>
                <li>Stage rehearsal slots will be communicated via email 48 hours prior to the live event.</li>
                <li>Keep polishing your moves — the judges are excited to see you live!</li>
              </ul>

              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #EEEEEE; text-align: center;">
                <p style="color: #777777; font-size: 13px; margin: 0;">
                  If you have any questions or need to make adjustments to your crew roster, reply directly to this email.
                </p>
                <p style="color: #0B6B6B; font-size: 15px; font-weight: 700; margin-top: 12px;">
                  Best of luck & bring the stage down! 🔥
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F7F7F7; padding: 18px 30px; text-align: center; border-top: 1px solid #EEEEEE;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Sent via Feedants Dance Competition Platform • Powered by Resend
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send selection notification email using Resend
 */
async function sendAcceptanceEmail({ leaderEmail, leaderName, teamName, danceStyle, memberCount, competitionTitle }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Feedants Competitions <onboarding@resend.dev>";

  const subject = `🎉 Congratulations! Your Dance Team "${teamName}" has been Selected!`;
  const html = generateSelectionEmailHtml({
    leaderName,
    teamName,
    danceStyle,
    memberCount,
    competitionTitle,
  });

  // If no API key or dummy key provided, simulate sending gracefully
  if (!apiKey || apiKey.trim() === "" || apiKey === "re_test_key" || apiKey.startsWith("your_")) {
    console.log(`\n📬 [Resend SIMULATION] Email to ${leaderEmail}:`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Team: ${teamName} (${memberCount} dancers, ${danceStyle})`);
    console.log(`   Note: Add RESEND_API_KEY to backend/.env to send real emails via Resend.\n`);

    return {
      success: true,
      simulated: true,
      id: `sim_${Date.now()}`,
      message: `Simulated: Email delivered to ${leaderEmail} (no Resend API key configured).`,
    };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [leaderEmail],
        subject: subject,
        html: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Resend API Error:", data);
      return {
        success: false,
        error: data.message || "Failed to send email via Resend",
        data,
      };
    }

    console.log(`✅ [Resend] Acceptance email successfully sent to ${leaderEmail}! ID: ${data.id}`);
    return {
      success: true,
      simulated: false,
      id: data.id,
    };
  } catch (error) {
    console.error("❌ Error sending email via Resend:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  sendAcceptanceEmail,
};
