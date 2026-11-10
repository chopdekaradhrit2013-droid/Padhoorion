import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Please provide your email/username and password." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier.toLowerCase() },
          { username: cleanIdentifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username/email or password." },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      const reasonText = user.banReason ? ` Reason: "${user.banReason}".` : "";
      return NextResponse.json(
        {
          error: `Your account has been suspended by an administrator.${reasonText}`,
          banned: true,
          banReason: user.banReason,
        },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username/email or password." },
        { status: 401 }
      );
    }

    if (!user.isVerified && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Your email address has not been verified yet. Please enter your 6-digit verification code to activate your account.",
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      grade: user.grade,
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        grade: user.grade,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        isBanned: user.isBanned,
        warningCount: user.warningCount,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}

