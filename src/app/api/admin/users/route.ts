import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, forbiddenResponse, unauthorizedResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";

    const where: any = {};
    if (search.trim()) {
      where.OR = [
        { username: { contains: search.trim() } },
        { email: { contains: search.trim() } },
        { grade: { contains: search.trim() } },
        { id: { contains: search.trim() } },
      ];
    }

    if (filter === "active") {
      where.isBanned = false;
    } else if (filter === "warned") {
      where.warningCount = { gt: 0 };
      where.isBanned = false;
    } else if (filter === "banned") {
      where.isBanned = true;
    } else if (filter === "admin") {
      where.role = "ADMIN";
    } else if (filter === "student") {
      where.role = "STUDENT";
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        grade: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isBanned: true,
        banReason: true,
        bannedAt: true,
        warningCount: true,
        lastWarningReason: true,
        lastWarningAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            resources: true,
            comments: true,
            likes: true,
            bookmarks: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// Moderation Action Handler: Ban, Warn, Unban
export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const body = await request.json();
    const { targetUserId, action, reason, ban } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required." }, { status: 400 });
    }

    if (targetUserId === user.id) {
      return NextResponse.json({ error: "You cannot moderate your own administrator account." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Determine intended action (support explicit action or legacy ban: boolean)
    const effectiveAction = action || (ban === true ? "ban" : ban === false ? "unban" : null);

    if (!effectiveAction) {
      return NextResponse.json({ error: "Invalid action. Supported actions: 'warn', 'ban', 'unban'." }, { status: 400 });
    }

    // 1. ACTION: WARN USER
    if (effectiveAction === "warn") {
      const cleanReason = (reason || "").trim();
      if (!cleanReason) {
        return NextResponse.json({ error: "A clear reason must be provided when issuing a warning." }, { status: 400 });
      }

      const newWarningCount = (targetUser.warningCount || 0) + 1;

      // 3rd Warning rule: Automatic permanent ban
      if (newWarningCount >= 3) {
        const autoBanReason = `Account automatically banned after 3 warnings. Final strike: ${cleanReason}`;

        const updated = await prisma.user.update({
          where: { id: targetUserId },
          data: {
            warningCount: 3,
            lastWarningReason: cleanReason,
            lastWarningAt: new Date(),
            isBanned: true,
            banReason: autoBanReason,
            bannedAt: new Date(),
          },
        });

        // Block email permanently
        await prisma.bannedEmail.upsert({
          where: { email: targetUser.email.toLowerCase() },
          update: { reason: autoBanReason, bannedAt: new Date() },
          create: { email: targetUser.email.toLowerCase(), reason: autoBanReason },
        });

        // Send alert notification
        await prisma.notification.create({
          data: {
            userId: targetUserId,
            actorId: user.id,
            type: "BAN",
            title: "Account Banned: 3/3 Community Warnings",
            message: autoBanReason,
            link: "/",
            isRead: false,
          },
        });

        return NextResponse.json({
          message: `User ${targetUser.username} received strike 3 of 3 and has been automatically banned. Email blocked.`,
          user: updated,
          autoBanned: true,
          warningCount: 3,
        });
      }

      // 1st or 2nd Warning
      const chancesRemaining = 3 - newWarningCount;

      const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          warningCount: newWarningCount,
          lastWarningReason: cleanReason,
          lastWarningAt: new Date(),
        },
      });

      // Send warning notification
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          actorId: user.id,
          type: "WARNING",
          title: `Official Warning (${newWarningCount}/3)`,
          message: `Reason: "${cleanReason}". You have ${chancesRemaining} chance${chancesRemaining === 1 ? "" : "s"} remaining before an automatic permanent ban.`,
          link: "/",
          isRead: false,
        },
      });

      return NextResponse.json({
        message: `Warning issued to ${targetUser.username} (${newWarningCount}/3). ${chancesRemaining} chance${chancesRemaining === 1 ? "" : "s"} remaining.`,
        user: updated,
        warningCount: newWarningCount,
        chancesRemaining,
      });
    }

    // 2. ACTION: BAN USER
    if (effectiveAction === "ban") {
      const cleanReason = (reason || "Violation of school community guidelines").trim();

      const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          isBanned: true,
          banReason: cleanReason,
          bannedAt: new Date(),
        },
      });

      // Add to BannedEmail so this email can never be registered again
      await prisma.bannedEmail.upsert({
        where: { email: targetUser.email.toLowerCase() },
        update: { reason: cleanReason, bannedAt: new Date() },
        create: { email: targetUser.email.toLowerCase(), reason: cleanReason },
      });

      // Issue ban notification
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          actorId: user.id,
          type: "BAN",
          title: "Account Suspended by Administrator",
          message: `Your account has been suspended. Reason: "${cleanReason}".`,
          link: "/",
          isRead: false,
        },
      });

      return NextResponse.json({
        message: `User ${targetUser.username} has been banned. Reason: "${cleanReason}". Email is blocked from future registration.`,
        user: updated,
      });
    }

    // 3. ACTION: UNBAN USER
    if (effectiveAction === "unban") {
      const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          isBanned: false,
          banReason: null,
          bannedAt: null,
          warningCount: 0,
          lastWarningReason: null,
        },
      });

      // Remove from BannedEmail
      await prisma.bannedEmail.deleteMany({
        where: { email: targetUser.email.toLowerCase() },
      });

      // Notify account reinstated
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          actorId: user.id,
          type: "INFO",
          title: "Account Reinstated",
          message: "Your account has been unbanned by the administrator and restored to good standing.",
          link: "/",
          isRead: false,
        },
      });

      return NextResponse.json({
        message: `User ${targetUser.username} has been unbanned. Warning count reset to 0 and email unblocked.`,
        user: updated,
      });
    }

    return NextResponse.json({ error: "Unsupported moderation action." }, { status: 400 });
  } catch (error) {
    console.error("Admin user moderation error:", error);
    return NextResponse.json({ error: "Failed to execute moderation action" }, { status: 500 });
  }
}

// 4. ACTION: PERMANENTLY PURGE / DELETE USER
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Target user ID is required." }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json({ error: "You cannot delete your own administrator account." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Cascade delete user and all associated content
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: `User ${targetUser.username} (${targetUser.email}) and all associated records have been permanently purged from the database.`,
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
