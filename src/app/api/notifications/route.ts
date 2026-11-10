import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            grade: true,
            avatarUrl: true,
          },
        },
      },
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
      return NextResponse.json({ message: "All notifications marked as read." });
    }

    if (notificationId) {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: user.id,
        },
        data: {
          isRead: true,
        },
      });
      return NextResponse.json({ message: "Notification marked as read." });
    }

    return NextResponse.json({ error: "No action specified." }, { status: 400 });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json({ error: "Failed to update notification." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      await prisma.notification.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json({ message: "All notifications cleared." });
    }

    if (notificationId) {
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId: user.id,
        },
      });
      return NextResponse.json({ message: "Notification deleted." });
    }

    return NextResponse.json({ error: "Notification ID or clearAll parameter required." }, { status: 400 });
  } catch (error) {
    console.error("Delete notification error:", error);
    return NextResponse.json({ error: "Failed to delete notification." }, { status: 500 });
  }
}
