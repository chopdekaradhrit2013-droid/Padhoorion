import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
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
        title: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        downloadsCount: true,
      },
    });

    if (!resource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    const fileName = resource.fileName || "study_resource.pdf";
    const mimeType = resource.fileType || "application/octet-stream";

    // 1. Data URL Handling (embedded Base64)
    if (resource.fileUrl.startsWith("data:")) {
      const parts = resource.fileUrl.split(",");
      const base64Data = parts[1];
      const mimeMatch = parts[0].match(/:(.*?);/);
      const actualMime = mimeMatch ? mimeMatch[1] : mimeType;
      const buffer = Buffer.from(base64Data, "base64");

      const headers = new Headers();
      headers.set("Content-Type", actualMime);
      headers.set(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
      );
      headers.set("Content-Length", buffer.length.toString());
      headers.set("Cache-Control", "no-cache");

      return new NextResponse(buffer, { status: 200, headers });
    }

    // 2. Remote URL Handling
    if (resource.fileUrl.startsWith("http://") || resource.fileUrl.startsWith("https://")) {
      return NextResponse.redirect(resource.fileUrl, 302);
    }

    // 3. Local Filesystem Handling (in public/uploads)
    const sanitizedFilename = path.basename(resource.fileUrl);
    const filePath = path.join(process.cwd(), "public", "uploads", sanitizedFilename);

    let fileBuffer: Buffer;
    let finalMime = mimeType;

    try {
      fileBuffer = await fs.readFile(filePath);
    } catch (err) {
      console.warn(`File on disk not found for resource ${id} at ${filePath}, generating fallback:`, err);
      // Clean fallback so student download never crashes with a broken 404
      const fallbackNote = `PADHOORION STUDY RESOURCE\n========================\n\nTitle: ${resource.title}\nResource ID: ${resource.id}\nOriginal Filename: ${fileName}\n\nNote: The note scan is available in your browser reader. If you need a re-scan, request it in the Doubt & Note Hub (/requests).\n\nBuilt by students, for students | PadhoOrion`;
      fileBuffer = Buffer.from(fallbackNote, "utf-8");
      finalMime = "text/plain";
    }

    const headers = new Headers();
    headers.set("Content-Type", finalMime);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
    );
    headers.set("Content-Length", fileBuffer.length.toString());
    headers.set("Cache-Control", "no-cache");

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (error) {
    console.error("Resource GET download error:", error);
    return new NextResponse("Failed to download resource", { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
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
        title: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
        downloadsCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      downloadUrl: `/api/resources/${resource.id}/download`,
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      downloadsCount: resource.downloadsCount,
    });
  } catch (error) {
    console.error("Download increment error:", error);
    return NextResponse.json({ error: "Failed to process download" }, { status: 500 });
  }
}
