import { NextResponse } from "next/server";
import { getAuthUserFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Admin access required.");

    const body = await request.json().catch(() => ({}));
    const targetEmail = (body.targetEmail || user.email || "").trim().toLowerCase();

    if (!targetEmail || !targetEmail.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const testCode = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await sendVerificationEmail({
      to: targetEmail,
      username: user.username || "Student",
      code: testCode,
    });

    if (!result.delivered) {
      return NextResponse.json(
        {
          error: result.error || "Failed to dispatch email. Please check your Gmail App Password.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      code: testCode,
      messageId: result.messageId,
      message: `Instant verification code [${testCode}] successfully delivered to ${targetEmail}! Check your inbox now.`,
    });
  } catch (error: any) {
    console.error("[TEST VERIFICATION CODE ERROR]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

