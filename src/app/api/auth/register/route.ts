import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { GRADES } from "@/lib/constants";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword, grade, avatarUrl } = body;

    // Validation
    if (!username || !email || !password || !grade) {
      return NextResponse.json(
        { error: "Username, email, password, and grade are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!GRADES.includes(grade as any)) {
      return NextResponse.json(
        { error: "Please select a valid grade from 6th to 10th Grade." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email has been permanently banned
    const banned = await prisma.bannedEmail.findUnique({
      where: { email: cleanEmail },
    });

    if (banned) {
      return NextResponse.json(
        {
          error: `This email address (${cleanEmail}) has been permanently banned from PadhoOrion. Reason: ${banned.reason || "Community policy violation"}. Registration is not allowed.`,
        },
        { status: 403 }
      );
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanUsername } },
          { email: { equals: cleanEmail } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === cleanEmail.toLowerCase()) {
        return NextResponse.json(
          { error: "This email is already registered. Please log in directly." },
          { status: 409 }
        );
      }

      if (existingUser.username.toLowerCase() === cleanUsername.toLowerCase()) {
        return NextResponse.json(
          { error: "Username is already taken. Please choose another." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await hashPassword(password);

    // Create user directly verified - no email code verification required!
    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        grade,
        avatarUrl: avatarUrl || null,
        role: "STUDENT",
        isVerified: true,
        verificationToken: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        grade: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
      },
    });

    // Create session token and log in immediately
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      grade: user.grade,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: "Account created successfully! Welcome to PadhoOrion.",
        user,
        requiresVerification: false,
      },
      { status: 201 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}

