import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/server-auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id: resourceId } = params;

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_resourceId: {
          userId: user.id,
          resourceId,
        },
      },
    });

    if (existing) {
      // Unbookmark
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ bookmarked: false, message: "Removed from bookmarks" });
    } else {
      // Bookmark
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          resourceId,
        },
      });

      return NextResponse.json({ bookmarked: true, message: "Added to your bookmarks" });
    }
  } catch (error) {
    console.error("Bookmark error:", error);
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}

