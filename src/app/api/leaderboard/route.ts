import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export function computeStudentBadges(userStats: {
  uploadsCount: number;
  mathUploads: number;
  scienceUploads: number;
  downloadsCount: number;
  likesCount: number;
  commentsCount: number;
}) {
  const badges: { id: string; label: string; icon: string; desc: string; color: string }[] = [];

  if (userStats.uploadsCount >= 1) {
    badges.push({
      id: "first_contributor",
      label: "First Contributor",
      icon: "🌟",
      desc: "Uploaded their first classroom study copy",
      color: "bg-amber-100 text-amber-900 border-amber-300",
    });
  }

  if (userStats.mathUploads >= 2) {
    badges.push({
      id: "math_maestro",
      label: "Math Maestro",
      icon: "📐",
      desc: "Shared 2+ Mathematics formula sheets or solved problem sets",
      color: "bg-indigo-100 text-indigo-900 border-indigo-300",
    });
  }

  if (userStats.scienceUploads >= 2) {
    badges.push({
      id: "science_scribe",
      label: "Science Scribe",
      icon: "🔬",
      desc: "Authored 2+ Science lab/lecture summaries",
      color: "bg-emerald-100 text-emerald-900 border-emerald-300",
    });
  }

  if (userStats.downloadsCount >= 5) {
    badges.push({
      id: "exam_lifesaver",
      label: "Exam Lifesaver",
      icon: "🏅",
      desc: "Study notes helped classmates with 5+ downloads",
      color: "bg-rose-100 text-rose-900 border-rose-300",
    });
  }

  if (userStats.likesCount >= 2) {
    badges.push({
      id: "peer_verified_topper",
      label: "Peer Verified Topper",
      icon: "🎯",
      desc: "Received multiple peer endorsements and upvotes",
      color: "bg-purple-100 text-purple-900 border-purple-300",
    });
  }

  if (userStats.commentsCount >= 3) {
    badges.push({
      id: "helpful_classmate",
      label: "Helpful Classmate",
      icon: "💡",
      desc: "Actively answers questions and discusses in note threads",
      color: "bg-sky-100 text-sky-900 border-sky-300",
    });
  }

  return badges;
}

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

