import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, forbiddenResponse, unauthorizedResponse } from "@/lib/server-auth";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const caller = await getAuthUserFromRequest();
    if (!caller) return unauthorizedResponse();
    if (caller.role !== "ADMIN") {
      return forbiddenResponse("Only administrators can initiate testing sessions.");
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        email: true,
        grade: true,
        role: true,
        isBanned: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (targetUser.isBanned) {
      return NextResponse.json({ error: "Cannot impersonate a banned user account." }, { status: 400 });
    }

    // Create session token for the target user, carrying the caller's admin id
    const token = await createSessionToken({
      userId: targetUser.id,
      username: targetUser.username,
      email: targetUser.email,
      role: targetUser.role,
      grade: targetUser.grade,
      impersonatedBy: caller.id,
    });

    const response = NextResponse.json({
      success: true,
      message: `Now logged in as ${targetUser.username} for testing purposes.`,
      user: targetUser,
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
    console.error("Admin impersonation error:", error);
    return NextResponse.json({ error: "Failed to initiate test session." }, { status: 500 });
  }
}

