import { NextResponse } from "next/server";
import { getAuthUserFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Admin access required.");

    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER || "";
    const hasPassword = Boolean(process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS);

    return NextResponse.json({
      configured: Boolean(gmailUser && hasPassword),
      gmailUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Admin access required.");

    const body = await request.json();
    const { gmailUser, appPassword, testRecipient } = body;

    if (!gmailUser || !appPassword) {
      return NextResponse.json(
        { error: "Gmail address and 16-character App Password are required." },
        { status: 400 }
      );
    }

    const cleanUser = gmailUser.trim();
    const cleanPass = appPassword.trim().replace(/\s+/g, "");

    // 1. Test SMTP Connection with Google
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: cleanUser,
        pass: cleanPass,
      },
    });

    try {
      await transporter.verify();
    } catch (verifyErr: any) {
      console.error("[GMAIL TEST VERIFY ERROR]:", verifyErr.message);
      return NextResponse.json(
        {
          error: `Google rejected the credentials: ${verifyErr.message}. Make sure 2-Step Verification is enabled on your Google Account and generate a 16-character App Password at https://myaccount.google.com/apppasswords`,
        },
        { status: 400 }
      );
    }

    // 2. Optionally dispatch a test email
    const recipient = testRecipient ? testRecipient.trim() : cleanUser;
    try {
      await transporter.sendMail({
        from: `PadhoOrion <${cleanUser}>`,
        to: recipient,
        subject: "PadhoOrion Gmail Delivery Test Success! 🎉",
        text: "Congratulations! PadhoOrion is now connected to Gmail. Verification codes will be delivered live to students' inboxes.",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e9e6dc; border-radius: 12px; background: #faf9f5;">
            <h2 style="color: #c96442; margin-top: 0;">PadhoOrion Email System Active! 🎉</h2>
            <p style="font-size: 14px; color: #3d3929;">
              This test confirms that your Gmail account (<strong>${cleanUser}</strong>) is successfully authenticated.
            </p>
            <p style="font-size: 13px; color: #57534e;">
              All future student verification codes and official warnings will now be sent straight to users' real email inboxes.
            </p>
          </div>
        `,
      });
    } catch (sendErr: any) {
      console.error("[GMAIL TEST SEND ERROR]:", sendErr.message);
    }

    // 3. Update runtime process.env
    process.env.GMAIL_USER = cleanUser;
    process.env.GMAIL_APP_PASSWORD = cleanPass;
    process.env.SMTP_USER = cleanUser;
    process.env.SMTP_PASS = cleanPass;

    // 4. Update .env file on disk
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
      }

      // Update GMAIL_USER
      if (/^GMAIL_USER=.*$/m.test(envContent)) {
        envContent = envContent.replace(/^GMAIL_USER=.*$/m, `GMAIL_USER="${cleanUser}"`);
      } else {
        envContent += `\nGMAIL_USER="${cleanUser}"`;
      }

      // Update GMAIL_APP_PASSWORD
      if (/^GMAIL_APP_PASSWORD=.*$/m.test(envContent)) {
        envContent = envContent.replace(/^GMAIL_APP_PASSWORD=.*$/m, `GMAIL_APP_PASSWORD="${cleanPass}"`);
      } else {
        envContent += `\nGMAIL_APP_PASSWORD="${cleanPass}"`;
      }

      fs.writeFileSync(envPath, envContent, "utf-8");
    } catch (fileErr) {
      console.error("[ENV WRITE ERROR]:", fileErr);
    }

    return NextResponse.json({
      success: true,
      message: `Gmail connected! A confirmation test email was sent to ${recipient}. Live inbox delivery is now ACTIVE.`,
    });
  } catch (error: any) {
    console.error("Email settings save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

