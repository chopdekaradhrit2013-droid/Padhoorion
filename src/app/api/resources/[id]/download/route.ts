import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        downloadsCount: { increment: 1 },
      },
      select: {
        id: true,
        fileUrl: true,
        fileName: true,
        downloadsCount: true,
      },
    });

    return NextResponse.json({
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      downloadsCount: resource.downloadsCount,
    });
  } catch (error) {
    console.error("Download increment error:", error);
    return NextResponse.json({ error: "Failed to process download" }, { status: 500 });
  }
}

