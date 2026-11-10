import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, forbiddenResponse, unauthorizedResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            grade: true,
          },
        },
        resource: {
          select: {
            id: true,
            title: true,
            grade: true,
            category: true,
            subject: true,
            fileUrl: true,
            author: {
              select: {
                id: true,
                username: true,
                grade: true,
              },
            },
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                username: true,
                grade: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Admin fetch reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();
    if (user.role !== "ADMIN") return forbiddenResponse("Administrator access required.");

    const { reportId, status } = await request.json();

    if (!reportId || !["PENDING", "RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json({ error: "Valid reportId and status required." }, { status: 400 });
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });

    return NextResponse.json({ message: `Report marked as ${status}`, report });
  } catch (error) {
    console.error("Admin update report error:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
