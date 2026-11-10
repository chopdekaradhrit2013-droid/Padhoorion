import nodemailer from "nodemailer";

interface SendVerificationEmailOptions {
  to: string;
  username: string;
  code: string;
}

export async function sendVerificationEmail({
  to,
  username,
  code,
}: SendVerificationEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || "";
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpFrom = process.env.SMTP_FROM || `PadhoOrion Community <${smtpUser || "noreply@padhoorion.com"}>`;

  // Email HTML Template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your PadhoOrion Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf9f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #3d3929;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf9f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e9e6dc; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #c96442; padding: 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">PadhoOrion</h1>
                    <p style="margin: 4px 0 0 0; color: #fde8e1; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">School Learning & Notes Community</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <h2 style="margin: 0 0 12px 0; color: #201e17; font-size: 18px; font-weight: 700;">Verify Your Email Address</h2>
                    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #57534e;">
                      Hi <strong>${username}</strong>,
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #57534e;">
                      Thank you for joining PadhoOrion! Please use the 6-digit verification code below to confirm your email and activate your student account:
                    </p>

                    <!-- Code Box -->
                    <div style="background-color: #faf9f5; border: 2px dashed #c96442; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                      <span style="display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #78716c; letter-spacing: 1px; margin-bottom: 8px;">6-Digit Verification Code</span>
                      <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #c96442; display: inline-block;">
                        ${code}
                      </span>
                    </div>

                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #78716c; line-height: 1.5;">
                      ⏰ This code will remain valid for 24 hours. Do not share this code with anyone.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #78716c; line-height: 1.5;">
                      If you did not request this verification code, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7f6f2; border-top: 1px solid #e9e6dc; padding: 18px 24px; text-align: center; font-size: 11px; color: #8c887b;">
                    PadhoOrion Educational Platform &bull; Made for Students
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  // If SMTP credentials (such as Gmail App Password) are present, dispatch via real SMTP!
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: smtpUser.includes("@gmail.com") ? "gmail" : undefined,
        host: smtpUser.includes("@gmail.com") ? undefined : smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to,
        subject: `Your PadhoOrion Verification Code: ${code}`,
        text: `Welcome to PadhoOrion! Your 6-digit email verification code is: ${code}\n\nEnter this code on the verification page to activate your account.`,
        html: htmlContent,
      });

      console.log(`[EMAIL DISPATCH] Successfully delivered verification email to ${to}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[EMAIL DISPATCH ERROR] Failed to send email via SMTP to ${to}:`, err.message);
      // Return success false with message, but log code so no one is blocked
      console.log(`[EMAIL DISPATCH FALLBACK] Code for ${to}: ${code}`);
      return { success: false, error: err.message };
    }
  }

  // If SMTP credentials are not configured yet, log to console for instant visibility
  console.log(`----------------------------------------------------------------`);
  console.log(`[PADHO-ORION EMAIL DISPATCH] 📬 VERIFICATION CODE FOR ${to}:`);
  console.log(`CODE: ${code} (recipient: ${username} <${to}>)`);
  console.log(`To enable live Gmail delivery, add GMAIL_USER and GMAIL_APP_PASSWORD to .env`);
  console.log(`----------------------------------------------------------------`);

  return { success: true };
}

