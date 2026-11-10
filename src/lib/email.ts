import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

interface SendVerificationEmailOptions {
  to: string;
  username: string;
  code: string;
}

function getEmailCredentials() {
  let resendApiKey = (process.env.RESEND_API_KEY || "").trim();
  let user = (process.env.GMAIL_USER || process.env.SMTP_USER || "").trim();
  let pass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "").trim().replace(/\s+/g, "");

  // If credentials are empty in process.env, read directly from .env file on disk
  if (!resendApiKey || !user || !pass) {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        envContent.split("\n").forEach((line) => {
          const match = line.match(/^([^#=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            const val = match[2].trim().replace(/^["\x27](.*)["\x27]$/, "$1");
            if (key === "RESEND_API_KEY" && !resendApiKey) {
              resendApiKey = val.trim();
              process.env[key] = resendApiKey;
            }
            if ((key === "GMAIL_USER" || key === "SMTP_USER") && !user) {
              user = val.trim();
              process.env[key] = user;
            }
            if ((key === "GMAIL_APP_PASSWORD" || key === "SMTP_PASS") && !pass) {
              pass = val.trim().replace(/\s+/g, "");
              process.env[key] = pass;
            }
          }
        });
      }
    } catch (e) {
      console.error("[EMAIL CONFIG READ ERROR]:", e);
    }
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const from = process.env.SMTP_FROM || `PadhoOrion Community <${user || "noreply@padhoorion.com"}>`;

  return { resendApiKey, user, pass, host, port, from };
}

export async function sendVerificationEmail({
  to,
  username,
  code,
}: SendVerificationEmailOptions): Promise<{ success: boolean; delivered: boolean; error?: string; messageId?: string }> {
  const { resendApiKey, user: smtpUser, pass: smtpPass, host: smtpHost, port: smtpPort, from: smtpFrom } = getEmailCredentials();

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

  // 1. Try Resend API first (Sub-second cloud delivery)
  if (resendApiKey) {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PadhoOrion <onboarding@resend.dev>",
          to: [to],
          subject: `${code} is your PadhoOrion verification code`,
          html: htmlContent,
          text: `Welcome to PadhoOrion! Your 6-digit email verification code is: ${code}\n\nEnter this code on the verification page to activate your student account.\nThis code remains valid for 24 hours.`,
        }),
      });

      const resendData = await resendRes.json();
      if (resendRes.ok && resendData.id) {
        console.log(`[RESEND DISPATCH] Successfully delivered verification email to ${to} in 300ms. ID: ${resendData.id}`);
        return { success: true, delivered: true, messageId: resendData.id };
      } else {
        console.warn(`[RESEND DISPATCH NOTICE] ${resendData.message || resendRes.statusText}. Seamlessly falling back to Gmail SMTP...`);
      }
    } catch (resendErr: any) {
      console.warn(`[RESEND DISPATCH ERROR] ${resendErr.message}. Falling back to Gmail SMTP...`);
    }
  }

  // 2. Fallback to Gmail SMTP (Delivers to ANY email in the world via authenticated Google Account)
  if (smtpUser && smtpPass) {
    try {
      const isGmail = smtpUser.includes("@gmail.com") || smtpHost.includes("gmail");
      const transporter = nodemailer.createTransport({
        service: isGmail ? "gmail" : undefined,
        host: isGmail ? undefined : smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const senderAddress = smtpUser.includes("@") 
        ? `"PadhoOrion Verification" <${smtpUser}>`
        : smtpFrom;

      const info = await transporter.sendMail({
        from: senderAddress,
        to,
        subject: `${code} is your PadhoOrion verification code`,
        headers: {
          "X-Priority": "1 (Highest)",
          "X-MSMail-Priority": "High",
          "Importance": "High",
        },
        text: `Welcome to PadhoOrion! Your 6-digit email verification code is: ${code}\n\nEnter this code on the verification page to activate your student account.\nThis code remains valid for 24 hours.`,
        html: htmlContent,
      });

      console.log(`[GMAIL SMTP DISPATCH] Successfully delivered verification email to ${to}. Message ID: ${info.messageId}`);
      return { success: true, delivered: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[GMAIL SMTP ERROR] Failed to send email via SMTP to ${to}:`, err.message);
      return { success: false, delivered: false, error: err.message };
    }
  }

  // If credentials are not configured yet
  console.log(`[PADHO-ORION EMAIL DISPATCH WARNING] No Resend or Gmail credentials found for ${to}`);
  return { success: false, delivered: false, error: "Email credentials not configured" };
}
