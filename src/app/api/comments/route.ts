import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";
import { checkRateLimit } from "@/lib/rate-limit";

// Add a comment or reply
export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    // Rate Limiting: 10 comments per minute
    const rateCheck = checkRateLimit(`comment:${user.id}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `You are posting comments too quickly. Please wait ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const { content, resourceId, parentId } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment text cannot be empty." }, { status: 400 });
    }

    if (!resourceId) {
      return NextResponse.json({ error: "Resource ID is required." }, { status: 400 });
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, title: true, grade: true, authorId: true },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }

    let parentComment: any = null;
    if (parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, authorId: true },
      });
      if (!parentComment) {
        return NextResponse.json({ error: "Parent comment not found." }, { status: 404 });
      }
    }

    // Create comment storing user's current grade snapshot at publication time
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        resourceId,
        authorId: user.id,
        authorGradeAtPublish: user.grade, // Requirement: snapshot at publication
        parentId: parentId || null,
      },
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
    });

    // Notify resource author or parent comment author
    if (parentId && parentComment && parentComment.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: parentComment.authorId,
          actorId: user.id,
          type: "REPLY",
          title: "New reply to your comment",
          message: `${user.username} [${user.grade}] replied to your comment on "${resource.title}"`,
          link: `/resource/${resource.id}`,
        },
      });
    } else if (!parentId && resource.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: resource.authorId,
          actorId: user.id,
          type: "COMMENT",
          title: "New comment on your resource",
          message: `${user.username} [${user.grade}] commented on "${resource.title}"`,
          link: `/resource/${resource.id}`,
        },
      });
    }

    // Record activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: parentId ? "REPLY" : "COMMENT",
        title: parentId ? "Replied to a comment" : "Commented on resource",
        description: `On "${resource.title}" (${resource.grade})`,
        gradeAtTime: user.grade,
        targetId: resource.id,
      },
    });

    return NextResponse.json({
      message: "Comment published successfully!",
      comment,
    }, { status: 201 });
  } catch (error) {
    console.error("Post comment error:", error);
    return NextResponse.json({ error: "Failed to post comment." }, { status: 500 });
  }
}

// Delete a comment
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.authorId !== user.id && user.role !== "ADMIN") {
      return forbiddenResponse("You do not have permission to delete this comment.");
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: "Failed to delete comment." }, { status: 500 });
  }
}

