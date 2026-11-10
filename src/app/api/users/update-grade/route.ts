import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest, unauthorizedResponse } from "@/lib/server-auth";
import { GRADES, GradeType } from "@/lib/constants";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest();
    if (!user) {
      return unauthorizedResponse();
    }

    const { newGrade } = await request.json();

    if (!newGrade || !GRADES.includes(newGrade as GradeType)) {
      return NextResponse.json(
        { error: "Invalid grade selection. Please pick a grade from 6th to 10th." },
        { status: 400 }
      );
    }

    if (user.grade === newGrade) {
      return NextResponse.json(
        { message: "Grade is already set to " + newGrade, user },
        { status: 200 }
      );
    }

    const previousGrade = user.grade;

    // Update user profile grade
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        grade: newGrade,
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

    // Record academic progression activity in historical timeline
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "GRADE_CHANGE",
        title: "Academic Grade Progression",
        description: `Promoted from ${previousGrade} to ${newGrade}`,
        gradeAtTime: newGrade,
      },
    });

    // Create session token with updated grade
    const token = await createSessionToken({
      userId: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      grade: updatedUser.grade,
    });

    const response = NextResponse.json({
      message: `Academic progression updated! You are now in ${newGrade}. Your public grade tag has been updated.`,
      user: updatedUser,
      previousGrade,
      newGrade,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Update grade error:", error);
    return NextResponse.json(
      { error: "Failed to update academic grade progression." },
      { status: 500 }
    );
  }
}

