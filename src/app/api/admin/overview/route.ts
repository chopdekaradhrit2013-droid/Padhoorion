import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, forbiddenResponse, unauthorizedResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const [
      totalUsers,
      totalResources,
      totalComments,
      pendingReportsCount,
      activeAnnouncementsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.resource.count(),
      prisma.comment.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.announcement.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalResources,
        totalComments,
        pendingReportsCount,
        activeAnnouncementsCount,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
