import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse, forbiddenResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) return unauthorizedResponse();

    const requestId = params.id;
    const body = await request.json().catch(() => ({}));
    const { status = "FULFILLED", fulfilledNoteId } = body;

    const noteRequest = await prisma.noteRequest.findUnique({
      where: { id: requestId },
    });

    if (!noteRequest) {
      return NextResponse.json({ error: "Note request not found." }, { status: 404 });
    }

    // Only author or admin can mark fulfilled
    if (noteRequest.authorId !== user.id && user.role !== "ADMIN") {
      return forbiddenResponse("Only the student who requested this note can mark it as resolved.");
    }

    const updated = await prisma.noteRequest.update({
      where: { id: requestId },
      data: {
        status: status === "OPEN" ? "OPEN" : "FULFILLED",
        fulfilledNoteId: fulfilledNoteId || noteRequest.fulfilledNoteId,
      },
    });

    return NextResponse.json({
      message: status === "OPEN" ? "Request reopened." : "Note request marked as fulfilled!",
      request: updated,
    });
  } catch (error) {
    console.error("Fulfill request error:", error);
    return NextResponse.json({ error: "Failed to update request status" }, { status: 500 });
  }
}

