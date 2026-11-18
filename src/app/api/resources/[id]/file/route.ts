import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

function getDataUrlPayload(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/i);
  if (!match) return null;

  return {
    contentType: match[1] || "application/octet-stream",
    buffer: Buffer.from(match[2], "base64"),
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: {
        id: true,
        fileUrl: true,
        fileName: true,
        fileType: true,
      },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const isDownload = url.searchParams.get("download") === "1";

    let fileBuffer: Buffer;
    let contentType = resource.fileType || "application/octet-stream";

    if (resource.fileUrl.startsWith("data:")) {
      const payload = getDataUrlPayload(resource.fileUrl);
      if (!payload) {
        return NextResponse.json({ error: "Invalid stored file data" }, { status: 400 });
      }
      fileBuffer = payload.buffer;
      contentType = payload.contentType;
    } else if (resource.fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", resource.fileUrl);
      fileBuffer = await fs.readFile(filePath);
    } else if (/^https?:\/\//i.test(resource.fileUrl)) {
      const response = await fetch(resource.fileUrl);
      if (!response.ok) {
        return NextResponse.json({ error: "External file unavailable" }, { status: 502 });
      }
      fileBuffer = Buffer.from(await response.arrayBuffer());
    } else {
      return NextResponse.json({ error: "File path is not available" }, { status: 404 });
    }

    const safeFileName = (resource.fileName || "download").replace(/[^a-zA-Z0-9._-]/g, "_");
    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "no-store, max-age=0",
      "Content-Length": String(fileBuffer.length),
    });

    if (isDownload) {
      headers.set(
        "Content-Disposition",
        `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`
      );
    }

    return new Response(new Uint8Array(fileBuffer), { status: 200, headers });
  } catch (error) {
    console.error("Serve resource file error:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
