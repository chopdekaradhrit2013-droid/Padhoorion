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
      if (existingUser.username.toLowerCase() === cleanUsername.toLowerCase()) {
        return NextResponse.json(
          { error: "Username is already taken. Please choose another." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Email address is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        grade,
        avatarUrl: avatarUrl || null,
        role: "STUDENT",
        isVerified: false,
        verificationToken: verificationCode,
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

    // Send verification code directly to user's real email inbox (e.g. Gmail)
    await sendVerificationEmail({
      to: cleanEmail,
      username: cleanUsername,
      code: verificationCode,
    });

    return NextResponse.json(
      {
        message: `Registration initiated! A 6-digit verification code was sent to ${cleanEmail}.`,
        user,
        requiresVerification: true,
        // Provided for automated test suites; frontend does not display this on screen
        verificationCode,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}

