import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { COOKIE_NAME, verifySessionToken } from "./auth";

export async function getAuthUserFromRequest() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload || !payload.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        grade: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isBanned: true,
        bio: true,
      },
    });

    if (!user || user.isBanned) return null;
    return {
      ...user,
      impersonatedBy: payload.impersonatedBy || null,
    };
  } catch {
    return null;
  }
}

export function unauthorizedResponse(message = "Unauthorized: Please log in") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden: Insufficient privileges") {
  return NextResponse.json({ error: message }, { status: 403 });
}

