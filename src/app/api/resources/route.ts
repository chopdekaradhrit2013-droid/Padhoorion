import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const category = searchParams.get("category");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");
    const authorId = searchParams.get("authorId");
    const sortBy = searchParams.get("sortBy") || "newest"; // "newest", "likes", "downloads"
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};

    if (grade && grade !== "all") {
      where.grade = grade;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (subject && subject !== "all") {
      where.subject = subject;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { topic: { contains: q } },
        { chapter: { contains: q } },
        { subject: { contains: q } },
        { tags: { contains: q } },
        { author: { username: { contains: q } } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "downloads") {
      orderBy = { downloadsCount: "desc" };
    } else if (sortBy === "likes") {
      orderBy = { likes: { _count: "desc" } };
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            grade: true, // User's current grade
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            bookmarks: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("List resources error:", error);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}
