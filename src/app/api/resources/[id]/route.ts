import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const currentUser = await getAuthUserFromRequest();

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            grade: true,
            avatarUrl: true,
            bio: true,
            role: true,
            createdAt: true,
          },
        },
        comments: {
          where: { parentId: null }, // Fetch root comments
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                grade: true,
                avatarUrl: true,
              },
            },
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    grade: true,
                    avatarUrl: true,
                  },
                },
              },
            },
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

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Increment view count asynchronously
    await prisma.resource.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    // Check if current user has liked or bookmarked
    let isLiked = false;
    let isBookmarked = false;

    if (currentUser) {
      const [like, bookmark] = await Promise.all([
        prisma.like.findUnique({
          where: {
            userId_resourceId: {
              userId: currentUser.id,
              resourceId: id,
            },
          },
        }),
        prisma.bookmark.findUnique({
          where: {
            userId_resourceId: {
              userId: currentUser.id,
              resourceId: id,
            },
          },
        }),
      ]);

      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    return NextResponse.json({
      resource,
      isLiked,
      isBookmarked,
    });
  } catch (error) {
    console.error("Fetch resource error:", error);
    return NextResponse.json({ error: "Failed to fetch resource" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    const { id } = params;

    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Only author or admin can delete
    if (resource.authorId !== user.id && user.role !== "ADMIN") {
      return forbiddenResponse("You do not have permission to delete this resource.");
    }

    // Delete file if on disk
    if (resource.fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", resource.fileUrl);
      try {
        await fs.unlink(filePath);
      } catch (e) {
        // file may already be removed or not found
      }
    }

    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete resource error:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
