import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

const CODE_TTL_MS = 24 * 60 * 60 * 1000;

function createVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, email, code, action } = body;

    if (action === "resend") {
      if (typeof email !== "string" || !email.trim()) {
        return NextResponse.json({ error: "Please enter your account email." }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      const limit = checkRateLimit(`verify-resend:${cleanEmail}`, 3, 15 * 60 * 1000);
      if (!limit.success) {
        return NextResponse.json(
          { error: "Too many resend requests. Please wait a little before trying again." },
          { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || 60) } }
        );
      }

      const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user || user.isVerified) {
        return NextResponse.json(
          { error: user ? "This email is already verified. Please log in." : "No unverified account found with this email." },
          { status: user ? 400 : 404 }
        );
      }
      if (user.isBanned) {
        return NextResponse.json({ error: "This account is suspended." }, { status: 403 });
      }

      const newCode = createVerificationCode();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: newCode,
          verificationTokenExpiry: new Date(Date.now() + CODE_TTL_MS),
        },
      });

      const emailResult = await sendVerificationEmail({
        to: cleanEmail,
        username: user.username,
        code: newCode,
      });
      if (!emailResult.delivered) {
        console.error("Verification email was not delivered:", emailResult.error || "Email provider error");
        return NextResponse.json(
          { error: "The email could not be sent. Please check the email settings and try again later." },
          { status: 503 }
        );
      }

      return NextResponse.json({ success: true, message: "A new verification code has been sent to your email." });
    }

    const searchCode = String(code || token || "").trim();
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!cleanEmail || !/^\d{6}$/.test(searchCode)) {
      return NextResponse.json(
        { error: "Enter the email address and the 6-digit verification code." },
        { status: 400 }
      );
    }

    const limit = checkRateLimit(`verify-code:${cleanEmail}`, 10, 15 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds || 60) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || user.isVerified || user.isBanned) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    }
    if (
      user.verificationToken !== searchCode ||
      !user.verificationTokenExpiry ||
      user.verificationTokenExpiry.getTime() <= Date.now()
    ) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    }

    // Update conditionally so a code cannot be consumed twice by concurrent requests.
    const result = await prisma.user.updateMany({
      where: {
        id: user.id,
        isVerified: false,
        verificationToken: searchCode,
        verificationTokenExpiry: { gt: new Date() },
      },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });
    if (result.count !== 1) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    }

    const sessionToken = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      grade: user.grade,
    });
    const response = NextResponse.json({
      message: "Email verified successfully! Welcome to PadhoOrion.",
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        grade: user.grade,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: true,
      },
    });
    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}
