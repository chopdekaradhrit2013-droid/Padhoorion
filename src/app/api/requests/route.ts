import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/server-auth";
import { GRADES, SUBJECTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get("grade");
    const subject = searchParams.get("subject");
    const status = searchParams.get("status"); // "OPEN" | "FULFILLED" | "all"
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (grade && grade !== "all") where.grade = grade;
    if (subject && subject !== "all") where.subject = subject;
    if (status && status !== "all") where.status = status;
    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { chapter: { contains: search.trim() } },
      ];
    }

    const requests = await prisma.noteRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            grade: true,
            avatarUrl: true,
            role: true,
          },
        },
        responses: {
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
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Fetch note requests error:", error);
    return NextResponse.json({ error: "Failed to fetch note requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { title, description, grade, subject, chapter } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required for your note request." }, { status: 400 });
    }

    if (!grade || !GRADES.includes(grade)) {
      return NextResponse.json({ error: "Please select a valid school grade." }, { status: 400 });
    }

    if (!subject || !SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: "Please select a valid subject." }, { status: 400 });
    }

    const noteRequest = await prisma.noteRequest.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        grade,
        subject,
        chapter: chapter?.trim() || null,
        authorId: user.id,
        status: "OPEN",
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
        responses: true,
      },
    });

    return NextResponse.json({
      message: "Note request posted to community! Classmates will be able to share their notes.",
      request: noteRequest,
    }, { status: 201 });
  } catch (error) {
    console.error("Create note request error:", error);
    return NextResponse.json({ error: "Failed to create note request" }, { status: 500 });
  }
}

