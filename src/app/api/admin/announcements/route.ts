import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, forbiddenResponse, unauthorizedResponse } from "@/lib/server-auth";
import { ANNOUNCEMENT_DURATIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Admin fetch announcements error:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const { title, content, priority, durationOption } = await request.json();

    if (!title || !content || !durationOption) {
      return NextResponse.json(
        { error: "Title, content, and duration option are required." },
        { status: 400 }
      );
    }

    const durationConfig = ANNOUNCEMENT_DURATIONS.find((d) => d.value === durationOption);
    if (!durationConfig) {
      return NextResponse.json({ error: "Invalid duration option." }, { status: 400 });
    }

    let expiresAt: Date | null = null;
    if (durationConfig.hours) {
      expiresAt = new Date(Date.now() + durationConfig.hours * 60 * 60 * 1000);
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        priority: priority || "NORMAL",
        durationOption,
        expiresAt,
        authorId: user.id,
        isActive: true,
      },
    });

    // Notify all active users of this school announcement
    const allUsers = await prisma.user.findMany({
      where: { isBanned: false },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: allUsers.map((u) => ({
        userId: u.id,
        actorId: user.id,
        type: "ANNOUNCEMENT",
        title: "School Announcement: " + title.trim(),
        message: content.trim().slice(0, 120) + (content.length > 120 ? "..." : ""),
        link: `/announcements?id=${announcement.id}`,
        isRead: false,
      })),
    });

    return NextResponse.json({
      message: "Announcement broadcasted successfully to all students!",
      announcement,
    }, { status: 201 });
  } catch (error) {
    console.error("Admin create announcement error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (announcement) {
      // Delete all notifications generated for this announcement across all users
      await prisma.notification.deleteMany({
        where: {
          OR: [
            { type: "ANNOUNCEMENT", title: { contains: announcement.title } },
            { link: `/announcements?id=${id}` },
          ],
        },
      });

      await prisma.announcement.delete({
        where: { id },
      });
    }

    return NextResponse.json({ message: "Announcement and synced notifications deleted successfully." });
  } catch (error) {
    console.error("Admin delete announcement error:", error);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
