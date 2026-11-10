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
      select: { id: true, title: true, authorId: true },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_resourceId: {
          userId: user.id,
          resourceId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      const likesCount = await prisma.like.count({ where: { resourceId } });
      return NextResponse.json({ liked: false, likesCount });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: user.id,
          resourceId,
        },
      });

      // Notify author if not liking own resource
      if (resource.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: resource.authorId,
            actorId: user.id,
            type: "LIKE",
            title: "Someone liked your resource",
            message: `${user.username} liked "${resource.title}"`,
            link: `/resource/${resource.id}`,
          },
        });
      }

      const likesCount = await prisma.like.count({ where: { resourceId } });
      return NextResponse.json({ liked: true, likesCount });
    }
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}

