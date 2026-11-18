import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeStudentBadges } from "@/lib/badges";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");

    const where: any = { isBanned: false };
    if (grade && grade !== "all") {
      where.grade = grade;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        grade: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        resources: {
          select: {
            id: true,
            subject: true,
            downloadsCount: true,
            _count: { select: { likes: true } },
          },
        },
        _count: {
          select: {
            resources: true,
            comments: true,
          },
        },
      },
    });

    const ranked = users.map((u) => {
      let downloadsCount = 0;
      let likesCount = 0;
      let mathUploads = 0;
      let scienceUploads = 0;

      u.resources.forEach((r) => {
        downloadsCount += r.downloadsCount || 0;
        likesCount += r._count?.likes || 0;
        if (r.subject === "Mathematics") mathUploads++;
        if (r.subject === "Science") scienceUploads++;
      });

      const uploadsCount = u._count.resources;
      const commentsCount = u._count.comments;

      // Scoring formula: Upload = 25 pts, Download = 5 pts, Like = 10 pts, Comment = 3 pts
      const points =
        uploadsCount * 25 +
        downloadsCount * 5 +
        likesCount * 10 +
        commentsCount * 3;

      const badges = computeStudentBadges({
        uploadsCount,
        mathUploads,
        scienceUploads,
        downloadsCount,
        likesCount,
        commentsCount,
      });

      return {
        id: u.id,
        username: u.username,
        grade: u.grade,
        avatarUrl: u.avatarUrl,
        role: u.role,
        uploadsCount,
        downloadsCount,
        likesCount,
        commentsCount,
        points,
        badges,
      };
    });

    // Sort descending by points
    ranked.sort((a, b) => b.points - a.points || b.uploadsCount - a.uploadsCount);

    return NextResponse.json({
      leaderboard: ranked,
      totalCount: ranked.length,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to generate leaderboard" }, { status: 500 });
  }
}

