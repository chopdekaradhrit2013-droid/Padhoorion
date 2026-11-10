import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    const { bio, avatarUrl } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        bio: typeof bio === "string" ? bio.trim() : user.bio,
        avatarUrl: typeof avatarUrl === "string" ? avatarUrl.trim() : user.avatarUrl,
      },
      select: {
        id: true,
        username: true,
        email: true,
        grade: true,
        role: true,
        avatarUrl: true,
        bio: true,
        isVerified: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}

