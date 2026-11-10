import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        isBanned: false,
        OR: [
          { username: { contains: query } },
          { grade: { contains: query } },
        ],
      },
      select: {
        id: true,
        username: true,
        grade: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            resources: true,
            comments: true,
          },
        },
      },
      take: 10,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}
