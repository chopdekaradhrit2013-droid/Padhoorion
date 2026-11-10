import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, forbiddenResponse, unauthorizedResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search.trim()) {
      where.OR = [
        { username: { contains: search.trim() } },
        { email: { contains: search.trim() } },
        { grade: { contains: search.trim() } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        grade: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: {
            resources: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// Ban or unban user
export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const { targetUserId, ban } = await request.json();

    if (!targetUserId || typeof ban !== "boolean") {
      return NextResponse.json({ error: "Target user ID and ban boolean required." }, { status: 400 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "You cannot ban your own administrator account." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { isBanned: ban },
      select: { id: true, username: true, isBanned: true },
    });

    return NextResponse.json({
      message: ban ? `User ${updated.username} has been banned.` : `User ${updated.username} has been unbanned.`,
      user: updated,
    });
  } catch (error) {
    console.error("Admin user ban error:", error);
    return NextResponse.json({ error: "Failed to update user ban state" }, { status: 500 });
  }
}
