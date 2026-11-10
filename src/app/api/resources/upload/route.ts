import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/server-auth";
import { GRADES, CATEGORIES } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";
import path from "path";
import fs from "fs/promises";

// Max file size: 25 MB
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
];

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    // Rate Limiting: 10 uploads per 10 minutes
    const rateCheck = checkRateLimit(`upload:${user.id}`, 10, 10 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: `Upload rate limit reached. Please wait ${rateCheck.retryAfterSeconds} seconds before uploading another file.` },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const grade = (formData.get("grade") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const subject = (formData.get("subject") as string)?.trim();
    const chapter = (formData.get("chapter") as string)?.trim();
    const topic = (formData.get("topic") as string)?.trim();
    const tags = (formData.get("tags") as string)?.trim() || "";
    const file = formData.get("file") as File | null;

    // Field validation
    if (!title || !description || !grade || !category || !subject || !chapter || !topic) {
      return NextResponse.json(
        { error: "Please fill in all required fields (title, description, grade, category, subject, chapter, topic)." },
        { status: 400 }
      );
    }

    if (!GRADES.includes(grade as any)) {
      return NextResponse.json(
        { error: "Invalid grade selected." },
        { status: 400 }
      );
    }

    const validCategoryNames = CATEGORIES.map((c) => c.name);
    if (!validCategoryNames.includes(category as any)) {
      return NextResponse.json(
        { error: "Invalid category selected." },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Please attach a document or image file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 25MB maximum upload limit." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF documents and image files (PNG, JPG, WEBP, SVG) are supported." },
        { status: 400 }
      );
    }

    // Save file locally to public/uploads
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${Date.now()}-${originalName}`;
    const destinationPath = path.join(uploadsDir, uniqueFilename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(destinationPath, buffer);

    const fileUrl = `/uploads/${uniqueFilename}`;

    // Create database resource
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        grade,
        category,
        subject,
        chapter,
        topic,
        tags,
        fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        authorId: user.id,
        authorGradeAtPublish: user.grade, // Requirement 8/9: Author's grade snapshot at publish time
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

    // Record user activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "UPLOAD",
        title: `Uploaded ${category}`,
        description: `${title} (${grade} • ${subject})`,
        gradeAtTime: user.grade,
        targetId: resource.id,
      },
    });

    return NextResponse.json(
      {
        message: "Resource uploaded successfully!",
        resource,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload resource error:", error);
    return NextResponse.json(
      { error: "Failed to upload resource. Please try again." },
      { status: 500 }
    );
  }
}

