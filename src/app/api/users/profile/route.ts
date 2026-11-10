import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username query required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
        },
      },
      select: {
        id: true,
        username: true,
        grade: true,
        role: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        isVerified: true,
        _count: {
          select: {
            resources: true,
            comments: true,
            likes: true,
          },
        },
        resources: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            title: true,
            description: true,
            grade: true,
            category: true,
            subject: true,
            chapter: true,
            topic: true,
            fileName: true,
            fileType: true,
            viewsCount: true,
            downloadsCount: true,
            createdAt: true,
            authorGradeAtPublish: true,
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 15,
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            gradeAtTime: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
