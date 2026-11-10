import { NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getAuthUserFromRequest();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  // Get unread notification count
  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  });

  return NextResponse.json({
    user: {
      ...user,
      unreadNotificationsCount: unreadCount,
    },
  });
}

