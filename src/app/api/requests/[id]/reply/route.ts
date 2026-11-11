import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();

    const requestId = params.id;
    const body = await request.json();
    const { content, resourceId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Reply content cannot be empty." }, { status: 400 });
    }

    const noteRequest = await prisma.noteRequest.findUnique({
      where: { id: requestId },
      select: { id: true, authorId: true, title: true },
    });

    if (!noteRequest) {
      return NextResponse.json({ error: "Note request not found." }, { status: 404 });
    }

    const reply = await prisma.noteRequestResponse.create({
      data: {
        requestId,
        authorId: user.id,
        content: content.trim(),
        resourceId: resourceId || null,
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

    // Notify author if someone replied to their request
    if (noteRequest.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: noteRequest.authorId,
          actorId: user.id,
          type: "REPLY",
          title: "Classmate Replied to Your Note Request",
          message: `${user.username} answered your request: "${noteRequest.title}"`,
          link: "/requests",
          isRead: false,
        },
      });
    }

    return NextResponse.json({
      message: "Reply posted successfully!",
      reply,
    });
  } catch (error) {
    console.error("Reply to request error:", error);
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 });
  }
}

