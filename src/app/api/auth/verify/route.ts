import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest } from "@/lib/server-auth";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, email, code, action } = body;

    // Resend verification code action
    if (action === "resend" && email) {
      const cleanEmail = email.toLowerCase().trim();
      const existingUser = await prisma.user.findFirst({
        where: { email: cleanEmail },
      });

      if (!existingUser) {
        return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
      }

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { verificationToken: newCode },
      });

      // Dispatch new code to Gmail/inbox immediately
      const emailResult = await sendVerificationEmail({
        to: cleanEmail,
        username: existingUser.username,
        code: newCode,
      });

      return NextResponse.json({
        success: true,
        message: `A fresh 6-digit verification code has been dispatched to your inbox (${cleanEmail}).`,
        emailDelivered: emailResult.delivered,
        verificationCode: newCode,
      });
    }

    // Verification by (email + code) or direct token
    const searchCode = (code || token || "").toString().trim();
    const searchEmail = email ? email.toLowerCase().trim() : undefined;

    if (searchCode) {
      let user = null;

      if (searchEmail) {
        user = await prisma.user.findFirst({
          where: {
            email: searchEmail,
            verificationToken: searchCode,
          },
        });
      } else {
        user = await prisma.user.findFirst({
          where: { verificationToken: searchCode },
        });
      }

      if (!user) {
        return NextResponse.json(
          { error: "Invalid or expired 6-digit verification code. Please check and try again." },
          { status: 400 }
        );
      }

      if (user.isBanned) {
        return NextResponse.json(
          { error: `This account has been suspended: "${user.banReason || "Policy violation"}"` },
          { status: 403 }
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null,
        },
        select: {
          id: true,
          username: true,
          email: true,
          grade: true,
          role: true,
          avatarUrl: true,
          isVerified: true,
        },
      });

      // Create session cookie so the student is immediately authenticated
      const sessionToken = await createSessionToken({
        userId: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        grade: updatedUser.grade,
      });

      const response = NextResponse.json({
        message: "Email verified successfully! Welcome to PadhoOrion.",
        success: true,
        user: updatedUser,
      });

      response.cookies.set({
        name: COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      });

      return response;
    }

    // Direct verification for current session user (e.g. clicking "Verify My Email" button in demo / dev environment)
    const currentUser = await getAuthUserFromRequest();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Verification code is required or please log in." },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    return NextResponse.json({
      message: "Email verified successfully! You now have full verified student access.",
      success: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}
