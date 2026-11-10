import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token } = body;

    if (token) {
      const user = await prisma.user.findFirst({
        where: { verificationToken: token },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Invalid or expired verification token." },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationToken: null,
        },
      });

      return NextResponse.json({
        message: "Email verified successfully! Your account is in good standing.",
        success: true,
      });
    }

    // Direct verification for current session user (e.g. clicking "Verify My Email" button in demo / dev environment)
    const currentUser = await getAuthUserFromRequest();
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required to verify." },
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
      message: "Email verified successfully! You now have full access badge.",
      success: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email." },
      { status: 500 }
    );
  }
}

