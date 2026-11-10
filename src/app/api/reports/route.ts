import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    const { targetType, targetId, reason, details } = await request.json();

    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { error: "Target type, ID, and reason are required." },
        { status: 400 }
      );
    }

    if (!["RESOURCE", "COMMENT"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid report target type." },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        targetType,
        resourceId: targetType === "RESOURCE" ? targetId : null,
        commentId: targetType === "COMMENT" ? targetId : null,
        reason: reason.trim(),
        details: details?.trim() || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Thank you for helping keep PadhoOrion safe. Our moderators will review this report shortly.",
        reportId: report.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Report creation error:", error);
    return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
  }
}

