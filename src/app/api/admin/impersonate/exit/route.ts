import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "No active session." }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload || !payload.impersonatedBy) {
      return NextResponse.json({ error: "Not currently in an impersonation test session." }, { status: 400 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: payload.impersonatedBy },
      select: {
        id: true,
        username: true,
        email: true,
        grade: true,
        role: true,
        isBanned: true,
      },
    });

    if (!adminUser || adminUser.role !== "ADMIN" || adminUser.isBanned) {
      return NextResponse.json({ error: "Original admin account is no longer valid." }, { status: 403 });
    }

    // Reissue admin token
    const adminToken = await createSessionToken({
      userId: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
      grade: adminUser.grade,
    });

    const response = NextResponse.json({
      success: true,
      message: "Exited test session and returned to Admin Console.",
      user: adminUser,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: adminToken,
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Admin exit impersonation error:", error);
    return NextResponse.json({ error: "Failed to exit test session." }, { status: 500 });
  }
}

